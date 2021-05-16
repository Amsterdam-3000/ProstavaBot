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
    static filterUsersByBirthday(users: Group["users"], date: Date) {
        return (users as User[]).filter(
            (user) =>
                user.personal_data.birthday &&
                user.personal_data.birthday.getMonth() === date.getMonth() &&
                user.personal_data.birthday.getDate() === date.getDate()
        );
    }
    static filterUsersExceptUserId(users: Group["users"], userId: number | undefined) {
        return (users as User[]).filter((user) => user.user_id !== userId);
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

    static getBirthdayUsersOnDateFromDB(date: Date) {
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
