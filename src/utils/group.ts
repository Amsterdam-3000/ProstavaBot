import { CODE } from "../constants";
import { Group, GroupDocument, Prostava, ProstavaType } from "../types";
import { GroupCollection } from "../models";
import { UserUtils } from "./user";
import { RegexUtils } from "./regex";
import { Types } from "mongoose";
import { Chat } from "telegraf/typings/core/types/typegram";

export class GroupUtils {
    static findProstavaTypeByEmoji(group: Group, emoji: string): ProstavaType | undefined {
        return group.settings.prostava_types.find((type) => type.emoji === emoji);
    }
    static deleteProstavaTypeByEmoji(group: Group, emoji: string): void {
        group.settings.prostava_types = group.settings.prostava_types.filter((type) => type.emoji !== emoji);
    }

    static createGroupForChat(chat: Chat, chatMembersCount: number): GroupDocument {
        return new GroupCollection({
            _id: chat.id,
            settings: {
                name: (chat as Chat.GroupChat).title,
                chat_members_count: chatMembersCount - 1,
                prostava_types: this.getRequiredProstavaTypes()
            }
        });
    }
    static addNewPostavaTypeFromText(group: Group, text: string): void {
        if (!group.settings.prostava_types.length) {
            group.settings.prostava_types = [];
        }
        const emoji = text.match(RegexUtils.matchEmoji());
        if (!emoji) {
            return;
        }
        const prostavaType = {
            emoji: emoji[0],
            text: text.replace(RegexUtils.matchEmoji(), "").replace(/\s/, "")
        };
        group.settings.prostava_types.push(prostavaType);
    }

    static isGroupModified(group: Group): boolean {
        return (group as GroupDocument).isModified();
    }
    static saveGroup(group: Group): Promise<GroupDocument> {
        return (group as GroupDocument).save();
    }
    static canDeleteProstavaType(typeOld: ProstavaType): boolean {
        return !this.getRequiredProstavaTypes().find((type) => type.emoji === typeOld.emoji);
    }

    static getRequiredProstavaTypes(): { emoji: string }[] {
        return [{ emoji: CODE.COMMAND.PROSTAVA }, { emoji: CODE.ACTION.PROFILE_BIRTHDAY }];
    }
    static populateGroupProstavas(group: Group): void {
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

    static getGroupsFromDB(): Promise<GroupDocument[] | null> {
        return GroupCollection.find().exec();
    }
    static getGroupByChatIdFromDB(chatId: number): Promise<GroupDocument | null> {
        return GroupCollection.findById(chatId).exec();
    }
    static async getGroupsByUserIdFromDB(userId: number, autopopulate = true): Promise<GroupDocument[]> {
        //TODO Need denormalization of users property (add id)
        const users = await UserUtils.getUsersByUserIdFromDB(userId);
        return GroupCollection.find(
            //TODO Add filter by user status (Add to DB when user leaves group)
            { _id: { $in: users.map((user) => user.group_id) } },
            {},
            {
                autopopulate: autopopulate
            }
        );
    }
}
