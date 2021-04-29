import { model, Schema, Types } from "mongoose";
import { PROSTAVA, CODE } from "../constants";
import { UserDocument, UserModel } from "../types";
import emojiToolkit from "emoji-toolkit";

const PersonalDataSchema = new Schema(
    {
        name: String,
        emoji: {
            type: String,
            default: CODE.ACTION.PROFILE_EMOJI,
            minLength: 2,
            maxLength: 8
        },
        birthday: Date
    },
    { _id: false }
);

const UserSchema = new Schema<UserDocument, UserModel>({
    _id: {
        type: Schema.Types.ObjectId,
        default: new Types.ObjectId()
    },
    user_id: {
        type: Number,
        required: true
    },
    group_id: {
        type: Number,
        required: true
    },
    personal_data: {
        type: PersonalDataSchema,
        default: {}
    }
});
UserSchema.virtual("user_link").get(function (this: UserDocument) {
    return `tg://user?id=${this.user_id}`;
});
UserSchema.virtual("user_photo").get(function (this: UserDocument) {
    if (this.personal_data.emoji) {
        return emojiToolkit
            .toImage(this.personal_data.emoji)
            ?.match(/(?<=src=")[^"]+/)[0]
            ?.replace("/32/", "/128/");
    }
    return undefined;
});

export const UserCollection = model<UserDocument, UserModel>(PROSTAVA.COLLECTION.USER, UserSchema);
