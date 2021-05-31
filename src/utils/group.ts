import { CODE } from "../constants";
import { Group, GroupDocument, Prostava, ProstavaType, User } from "../types";
import { GroupCollection } from "../models";
import { UserUtils } from "./user";
import { ConverterUtils } from "./converter";
import { ProstavaUtils } from "./prostava";
import { Types } from "mongoose";
import { Chat } from "telegraf/typings/core/types/typegram";
import { join } from "path";
import ical from "ical-generator";

export class GroupUtils {
    static findGroupByChatIdFromDB(chatId: number) {
        return GroupCollection.findById(chatId).exec();
    }
    static findProstavaTypeByEmoji(group: Group, emoji: string) {
        return group.settings.prostava_types.find((type) => type.emoji === emoji);
    }
    static deleteProstavaTypeByEmoji(group: Group, emoji: string) {
        group.settings.prostava_types = group.settings.prostava_types.filter((type) => type.emoji !== emoji);
    }

    static createGroupForChat(chat: Chat, chatMembersCount: number) {
        return new GroupCollection({
            _id: chat.id,
            settings: {
                name: (chat as Chat.GroupChat).title,
                chat_members_count: chatMembersCount - 1,
                prostava_types: this.getRequiredProstavaTypes()
            }
        });
    }
    static addNewPostavaTypeFromText(group: Group, text: string) {
        if (!group.settings.prostava_types.length) {
            group.settings.prostava_types = [];
        }
        const prostavaType = {
            emoji: text
        };
        group.settings.prostava_types.push(prostavaType);
    }

    static isGroupModified(group: Group) {
        return (group as GroupDocument).isModified();
    }
    static saveGroup(group: Group) {
        return (group as GroupDocument).save();
    }
    static canDeleteProstavaType(typeOld: ProstavaType) {
        return !this.getRequiredProstavaTypes().find((type) => type.emoji === typeOld.emoji);
    }

    static getRequiredProstavaTypes() {
        return [{ emoji: CODE.COMMAND.PROSTAVA }, { emoji: CODE.ACTION.PROFILE_BIRTHDAY }];
    }
    static populateGroupProstavas(group: Group) {
        //TODO Autopopulate via mongo mb???
        (group.prostavas as Prostava[]).forEach(async (prostava) => {
            prostava.author = UserUtils.findUserById(group.users, prostava.author as Types.ObjectId) || prostava.author;
            prostava.creator =
                UserUtils.findUserById(group.users, prostava.creator as Types.ObjectId) || prostava.creator;
            prostava.participants?.forEach((participant) => {
                participant.user =
                    UserUtils.findUserById(group.users, participant.user as Types.ObjectId) || participant.user;
            });
        });
    }

    static saveGroupCalendarOfProstavasToPublic(group: Group) {
        const calendar = ical(ConverterUtils.convertGroupToCalendar(group));
        (ProstavaUtils.filterScheduledProstavas(group.prostavas) as Prostava[]).forEach((prostava) => {
            const event = calendar.createEvent(ConverterUtils.convertProstavaToEvent(prostava));
            prostava.participants.forEach((participant) => {
                event.createAttendee(ConverterUtils.convertParticipantToAttendee(participant));
            });
            (ProstavaUtils.filterUsersPendingToRateProstava(group.users, prostava) as User[]).forEach((user) => {
                event.createAttendee(ConverterUtils.convertUserToAttendee(user));
            });
        });
        calendar.save(join("public/calendar", `${group._id}.ics`));
    }
    static getAllGroupsFromDB() {
        //TODO Disable autopopulate?
        return GroupCollection.find().exec();
    }
}
