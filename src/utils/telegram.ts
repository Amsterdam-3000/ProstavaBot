import { CallbackQuery, Chat, ChatMember, Message, User } from "telegraf/typings/core/types/typegram";
import { CONFIG } from "../commons/config";
import { TELEGRAM } from "../constants";
import { SceneState, UpdateContext } from "../types";
import { RegexUtils } from "./regex";

export class TelegramUtils {
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

    static getUserString(user: User): string {
        if (user.username) {
            return user.username;
        }
        return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    static getUserLink(user: User): string {
        return `tg://user?id=${user.id}`;
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
        return this.getTextMessage(ctx).text?.replace(RegexUtils.matchCommand(), "");
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
}
