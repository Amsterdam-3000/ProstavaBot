import { model, Schema, Types } from "mongoose";
import { ConverterUtils } from "../utils";
import { PROSTAVA, CODE } from "../constants";
import { UserDocument, UserModel, PersonalData } from "../types";

const PersonalDataSchema = new Schema(
    {
        name: String,
        emoji: {
            type: String,
            default: CODE.ACTION.PROFILE_EMOJI,
            minLength: 1,
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
    is_bot: {
        type: Boolean,
        default: false
    },
    personal_data: {
        type: PersonalDataSchema,
        default: {} as PersonalData
    }
});
UserSchema.virtual("user_link").get(function (this: UserDocument) {
    return `tg://user?id=${this.user_id}`;
});
UserSchema.virtual("user_photo").get(function (this: UserDocument) {
    const emojiImageUrl = ConverterUtils.getEmojiImageUrl(this.personal_data?.emoji);
    return emojiImageUrl ? emojiImageUrl : "https://cdn.jsdelivr.net/joypixels/assets/6.5/png/unicode/128/1f921.png";
});
UserSchema.virtual("user_string").get(function (this: UserDocument) {
    return this.personal_data.emoji + " " + this.personal_data.name;
});

export const UserCollection = model<UserDocument, UserModel>(PROSTAVA.COLLECTION.USER, UserSchema);
