import { Group, User, UserDocument } from "../types";
import { Types } from "mongoose";
import { TelegramUtils } from "./telegram";
import { User as TelegramUser } from "typegram";
import { UserCollection } from "../models";

export class UserUtils {
    static createUserForGroup(group: Group, user: TelegramUser) {
        return new UserCollection({
            _id: Types.ObjectId(),
            user_id: user.id,
            group_id: group._id,
            personal_data: {
                name: TelegramUtils.getUserString(user)
            }
        });
    }

    static isUserModified(user: User) {
        return (user as UserDocument).isModified();
    }
    static saveUser(user: User) {
        return (user as UserDocument).save();
    }

    static findUserById(users: Group["users"], userId: User["_id"]) {
        return (users as User[]).find((user) => user._id.equals(userId));
    }
    static findUserByUserId(users: Group["users"], userId: number | undefined) {
        return (users as User[]).find((user) => user.user_id === userId);
    }

    static filterUsersExceptUserId(users: Group["users"], userId: number | undefined) {
        return (users as User[]).filter((user) => user.user_id !== userId);
    }
}
