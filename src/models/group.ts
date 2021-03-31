import { model, Schema } from "mongoose";
import { DB_COLLECTION } from "../commons/constants";
import { GroupDocument, GroupModel, GroupSettings } from "../types/mongoose";

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
        },
        language: {
            type: String,
            default: "en",
            minLength: 2,
            maxLength: 2
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

const GroupCollection = model<GroupDocument, GroupModel>(DB_COLLECTION.GROUP, GroupSchema);

export const upsertGroup = async (groupId: number): Promise<GroupDocument> =>
    GroupCollection.findOneAndUpdate({ _id: groupId }, {}, { upsert: true, setDefaultsOnInsert: true });

export const updateSettings = async (groupId: number, settings: GroupSettings) =>
    GroupCollection.updateOne({ _id: groupId }, { $set: { settings: settings } });
