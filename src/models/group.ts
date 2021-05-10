import { model, Schema } from "mongoose";
import { PROSTAVA, LOCALE, CODE } from "../constants";
import { GroupModel, GroupDocument } from "../types";
import { ProstavaTypeSchema } from "./prostava";

const GroupSettinsSchema = new Schema(
    {
        language: {
            type: String,
            default: LOCALE.LANGUAGE.EN,
            minLength: 2,
            maxLength: 2
        },
        currency: {
            type: String,
            default: CODE.CURRENCY.DOLLAR,
            minLength: 1,
            maxLength: 1
        },
        prostava_types: [
            {
                type: ProstavaTypeSchema,
                default: []
            }
        ],
        create_days_ago: {
            type: Number,
            default: 0
        },
        chat_members_count: {
            type: Number,
            default: 0
        },
        participants_min_percent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        pending_hours: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const GroupSchema = new Schema<GroupDocument, GroupModel>(
    {
        _id: Number,
        settings: {
            type: GroupSettinsSchema,
            default: {}
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: PROSTAVA.COLLECTION.USER,
                autopopulate: true
            }
        ],
        prostavas: [
            {
                type: Schema.Types.ObjectId,
                ref: PROSTAVA.COLLECTION.PROSTAVA,
                autopopulate: true
            }
        ]
    },
    { _id: false }
);
GroupSchema.plugin(require("mongoose-autopopulate"));
GroupSchema.virtual("group_photo").get(function (this: GroupDocument) {
    return "https://cdn.jsdelivr.net/joypixels/assets/6.5/png/unicode/128/1f465.png";
});

export const GroupCollection = model<GroupDocument, GroupModel>(PROSTAVA.COLLECTION.GROUP, GroupSchema);
