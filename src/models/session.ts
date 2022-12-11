import { model, Schema, Types } from "mongoose";
import { PROSTAVA } from "../constants";
import { SessionDocument, SessionModel } from "../types";

const SessionDataSchema = new Schema({ chat_id: Number }, { _id: false });

const SessionSchema = new Schema<SessionDocument>({
    _id: {
        type: Schema.Types.ObjectId,
        default: new Types.ObjectId()
    },
    key: {
        type: String,
        required: true
    },
    data: {
        type: SessionDataSchema,
        required: true
    }
});

export const SessionCollection = model<SessionDocument, SessionModel>(PROSTAVA.COLLECTION.SESSION, SessionSchema);
