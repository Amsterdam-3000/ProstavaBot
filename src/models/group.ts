import { Model, model, Schema } from "mongoose";
import { DB_COLLECTION } from "../commons/constants";
import { GroupModel, GroupDocument, GroupSettings, Group, User } from "../types";
import * as mongooseAutoPopulate from "mongoose-autopopulate";

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
        settings: GroupSettinsSchema,
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: DB_COLLECTION.USER,
                autopopulate: true
            }
        ]
    },
    { _id: false }
);

GroupSchema.plugin(mongooseAutoPopulate);

GroupSchema.statics.upsertGroup = async function (this: Model<GroupDocument>, groupId: Group["_id"]) {
    return this.findOneAndUpdate({ _id: groupId }, {}, { upsert: true, setDefaultsOnInsert: true });
};

GroupSchema.statics.updateSettings = async function (
    this: Model<GroupDocument>,
    groupId: Group["_id"],
    settings: GroupSettings
) {
    return this.updateOne({ _id: groupId }, { $set: { settings: settings } });
};

GroupSchema.statics.pushUser = async function (this: Model<GroupDocument>, groupId: Group["_id"], userId: User["_id"]) {
    return this.updateOne({ _id: groupId }, { $addToSet: { users: userId } });
};

GroupSchema.statics.popUser = async function (this: Model<GroupDocument>, groupId: Group["_id"], userId: User["_id"]) {
    return this.updateOne({ _id: groupId }, { $pull: { users: userId } });
};

export const GroupCollection = model<GroupDocument, GroupModel>(DB_COLLECTION.GROUP, GroupSchema);
