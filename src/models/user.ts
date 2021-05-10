import { model, Schema, Types } from "mongoose";
import { PROSTAVA, CODE } from "../constants";
import { UserDocument, UserModel } from "../types";
import emojiToolkit from "emoji-toolkit";
import emojiUnicode from "emoji-unicode";

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
    const emojiImageUrl = emojiToolkit.toImage(this.personal_data?.emoji)?.match(/(?<=src=")[^"]+/);
    if (emojiImageUrl?.length) {
        return emojiImageUrl[0]?.replace("/32/", "/128/");
    }
    const emojiCode = emojiUnicode(this.personal_data?.emoji);
    if (emojiCode && !emojiCode.includes(" ")) {
        return `https://cdn.jsdelivr.net/joypixels/assets/6.5/png/unicode/128/${emojiCode}.png`;
    }
    return "https://cdn.jsdelivr.net/joypixels/assets/6.5/png/unicode/128/1f921.png";
});
UserSchema.virtual("user_string").get(function (this: UserDocument) {
    return this.personal_data.emoji + " " + this.personal_data.name;
});

export const UserCollection = model<UserDocument, UserModel>(PROSTAVA.COLLECTION.USER, UserSchema);
