import { model, Schema } from "mongoose";
import { DB_COLLECTION } from "../commons/constants";
import { GroupDocument, GroupModel } from "../types/mongoose";

const GroupSettinsSchema = new Schema(
    {
        open_period: {
            type: Number,
            default: 0
        },
        min_percent: {
            type: Number,
            default: 0
        },
        prev_period: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const GroupSchema = new Schema<GroupDocument, GroupModel>(
    {
        _id: Number,
        settings: GroupSettinsSchema
    },
    { _id: false }
);

export const GroupCollection = model<GroupDocument, GroupModel>(DB_COLLECTION.GROUP, GroupSchema);
