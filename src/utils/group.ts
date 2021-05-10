import { Group, GroupDocument, Prostava, ProstavaType } from "../types";
import { UserUtils } from "./user";
import { Types } from "mongoose";
import { GroupCollection } from "../models";
import { CODE } from "../constants";
import { Chat } from "telegraf/typings/core/types/typegram";

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
}
