import { model, Schema, Types } from "mongoose";
import { PROSTAVA } from "../constants";
import { ProstavaCost, ProstavaDocument, ProstavaModel, ProstavaStatus, ProstavaVenue } from "../types";

const CostSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 1
        }
    },
    { _id: false }
);
CostSchema.virtual("string").get(function (this: ProstavaCost) {
    if (this.amount && this.currency) {
        return this.amount + this.currency;
    }
    if (this.amount) {
        return this.amount;
    }
    return undefined;
});

const LocationSchema = new Schema(
    {
        longitude: {
            type: Number,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);
const VenueSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        address: String,
        location: {
            type: LocationSchema,
            required: true
        }
    },
    { _id: false }
);
VenueSchema.virtual("url").get(function (this: ProstavaVenue) {
    if (this.location) {
        return (
            "https://yandex.ru/maps/?z=13&l=map" +
            `&ll=${this.location.longitude},${this.location.latitude}` +
            `&pt=${this.location.longitude},${this.location.latitude},pm2dirm`
        );
    }
    return undefined;
});
VenueSchema.virtual("thumb").get(function (this: ProstavaVenue) {
    if (this.location) {
        return (
            "https://static-maps.yandex.ru/1.x/?size=256,144&z=13&l=map" +
            `&ll=${this.location.longitude},${this.location.latitude}` +
            `&pt=${this.location.longitude},${this.location.latitude},pm2dirm`
        );
    }
    return undefined;
});

const ProstavaDataSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        venue: {
            type: VenueSchema,
            required: true
        },
        cost: {
            type: CostSchema,
            required: true
        }
    },
    { _id: false }
);

const ProstavaParticipantSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: PROSTAVA.COLLECTION.USER,
            required: true
        },
        rating: {
            type: Number,
            default: 0,
            min: -1,
            max: 5
        }
    },
    { _id: false }
);

const ProstavaSchema = new Schema<ProstavaDocument, ProstavaModel>({
    _id: {
        type: Schema.Types.ObjectId,
        default: new Types.ObjectId()
    },
    group_id: {
        type: Number,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: PROSTAVA.COLLECTION.USER,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: ProstavaStatus.New,
        enum: Object.values(ProstavaStatus)
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    prostava_data: {
        type: ProstavaDataSchema,
        required: true
    },
    participants: {
        type: [ProstavaParticipantSchema],
        default: []
    },
    participants_min_count: Number,
    participants_max_count: Number,
    closing_date: Date
});
ProstavaSchema.virtual("rating_string").get(function (this: ProstavaDocument) {
    return this.rating?.toFixed(1);
});
ProstavaSchema.virtual("participants_string").get(function (this: ProstavaDocument) {
    return this.participants?.length.toString();
});

export const ProstavaCollection = model<ProstavaDocument, ProstavaModel>(PROSTAVA.COLLECTION.PROSTAVA, ProstavaSchema);