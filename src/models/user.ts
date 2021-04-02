import { Model, model, Schema } from "mongoose";
import { DB_COLLECTION, DEFAULT_CODE } from "../commons/constants";
import { PersonalData, User, UserDocument, UserModel } from "../types";
import { GroupCollection } from "./group";

const PersonalDataSchema = new Schema(
    {
        emoji: {
            type: String,
            default: DEFAULT_CODE.EMOJI,
            minLength: 2,
            maxLength: 8
        },
        birthday: Date
    },
    { _id: false }
);

const UserSchema = new Schema<UserDocument, UserModel>({
    _id: Schema.Types.ObjectId,
    user_id: Number,
    group_id: {
        type: Number,
        require: true
    },
    personal_data: PersonalDataSchema
});

UserSchema.statics.upsertUser = async function (
    this: Model<UserDocument>,
    userId: User["user_id"],
    groupId: User["group_id"]
) {
    return this.findOneAndUpdate(
        { user_id: userId, group_id: groupId },
        {},
        { upsert: true, setDefaultsOnInsert: true }
    );
};

UserSchema.post("findOneAndUpdate", (user: User) => {
    GroupCollection.pushUser(user.group_id, user._id);
});

UserSchema.statics.updatePersonalData = async function (
    this: Model<UserDocument>,
    userId: User["user_id"],
    groupId: User["group_id"],
    personal_data: PersonalData
) {
    return this.updateOne({ user_id: userId, group_id: groupId }, { $set: { personal_data: personal_data } });
};

UserSchema.post("findOneAndDelete", (user: User) => {
    GroupCollection.popUser(user.group_id, user._id);
});

export const UserCollection = model<UserDocument, UserModel>(DB_COLLECTION.USER, UserSchema);
