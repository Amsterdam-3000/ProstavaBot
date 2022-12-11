import { Group, User, UserDocument } from "../types";
import { Types } from "mongoose";
import { TelegramUtils } from "./telegram";
import { User as TelegramUser } from "telegraf/typings/core/types/typegram";
import { UserCollection } from "../models";
import { CODE } from "../constants";

export class UserUtils {
    static createUserForGroup(group: Group, user: TelegramUser) {
        return new UserCollection({
            _id: new Types.ObjectId(),
            user_id: user.id,
            group_id: group._id,
            is_bot: user.is_bot,
            personal_data: {
                name: TelegramUtils.getUserString(user),
                emoji: user.is_bot ? CODE.ACTION.PROFILE_BOT : CODE.ACTION.PROFILE_EMOJI
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
    static filterRealUsersByBirthday(users: Group["users"], date: Date) {
        return this.filterRealUsers(users).filter(
            (user) =>
                user.personal_data.birthday &&
                user.personal_data.birthday.getMonth() === date.getMonth() &&
                user.personal_data.birthday.getDate() === date.getDate()
        );
    }
    static filterRealUsersExceptUserId(users: Group["users"], userId: number | undefined) {
        return this.filterRealUsers(users).filter((user) => user.user_id !== userId);
    }
    static filterRealUsers(users: Group["users"]) {
        return (users as User[]).filter((user) => this.isUserReal(user));
    }

    static isUserReal(user: User) {
        return !user.is_bot;
    }

    static getUserAgeByDate(user: User, date: Date = new Date()) {
        if (!user.personal_data.birthday) {
            return 0;
        }
        let age = date.getFullYear() - user.personal_data.birthday.getFullYear();
        if (
            date.getMonth() < user.personal_data.birthday.getMonth() ||
            (date.getMonth() === user.personal_data.birthday.getMonth() &&
                date.getDate() < user.personal_data.birthday.getDate())
        ) {
            age = age - 1;
        }
        return age;
    }

    static getUsersByUserIdFromDB(userId: User["user_id"]): Promise<UserDocument[]> {
        return UserCollection.find({ user_id: userId }).exec();
    }
    static getBirthdayUsersOnDateFromDB(date: Date): Promise<UserDocument[]> {
        return UserCollection.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$personal_data.birthday" }, date.getMonth() + 1] },
                    { $eq: [{ $dayOfMonth: "$personal_data.birthday" }, date.getDate()] }
                ]
            }
        }).exec();
    }
}
