import { CallbackQuery, Chat, ChatMember, Message, Update, User } from "telegraf/typings/core/types/typegram";
import { CONFIG } from "../commons/config";
import { TELEGRAM } from "../constants";
import { SceneState, UpdateContext } from "../types";
import { RegexUtils } from "./regex";

export class TelegramUtils {
    static fillCommandFakeUpdate(command: string, chatId: number, userId: number): Update.MessageUpdate {
        return {
            update_id: 0,
            message: {
                message_id: 0,
                chat: {
                    id: chatId,
                    type: "supergroup",
                    title: ""
                },
                from: {
                    id: userId,
                    is_bot: false,
                    first_name: ""
                },
                text: `/${command}`,
                date: Date.now(),
                entities: [
                    {
                        type: "bot_command",
                        offset: 0,
                        length: command.length + 1
                    }
                ]
            }
        };
    }
    //TODO Delete after fix typings bug
    static fillFakeContext(chatId: number, userId: number) {
        return {
            chat: { id: chatId },
            from: { id: userId },
            session: { __scenes: { state: { message: { message_id: 0 } } } }
        };
    }

    static getChatFromContext(ctx: UpdateContext) {
        return ctx.chat || ctx.session?.chat;
    }
    static getUserFromContext(ctx: UpdateContext) {
        return ctx.callbackQuery?.from || ctx.from;
    }
    static setSceneStateToContext(ctx: UpdateContext, sceneState: SceneState) {
        ctx.scene.state = sceneState;
    }

    static getCommandText(ctx: UpdateContext) {
        return this.getTextMessage(ctx).text?.replace(RegexUtils.matchCommand(), "").trim();
    }
    static getCbQueryData(ctx: UpdateContext) {
        return (ctx.callbackQuery as CallbackQuery.DataCallbackQuery)?.data;
    }
    static getTextMessage(ctx: UpdateContext) {
        return ctx.message as Message.TextMessage;
    }
    static getVenueMessage(ctx: UpdateContext) {
        return ctx.message as Message.VenueMessage;
    }
    static getLocationMessage(ctx: UpdateContext) {
        return ctx.message as Message.LocationMessage;
    }
    static getSceneState(ctx: UpdateContext) {
        return ctx.scene.state as SceneState;
    }

    static getUserString(user: User | undefined) {
        if (!user) {
            return "";
        }
        if (user.username) {
            return user.username;
        }
        return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }

    static isMessageCommand(ctx: UpdateContext, command?: string) {
        return RegexUtils.matchCommand(command).test(this.getTextMessage(ctx)?.text);
    }
    static isChatGroup(chat: Chat) {
        return chat.type === TELEGRAM.CHAT_TYPE.GROUP || chat.type === TELEGRAM.CHAT_TYPE.SUPERGROUP;
    }
    static isMemberAdmin(member: ChatMember) {
        return (
            member.user.id === CONFIG.SUPER_ADMIN_ID ||
            member.status === TELEGRAM.MEMBER_STATUS.OWNER ||
            member.status === TELEGRAM.MEMBER_STATUS.ADMIN
        );
    }
    static isUserReal(user: User | undefined) {
        return !user?.is_bot;
    }
}
