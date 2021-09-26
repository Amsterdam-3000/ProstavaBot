import { CallbackQuery, Chat, ChatMember, Message, Update, User } from "telegraf/typings/core/types/typegram";
import { SHA256, HmacSHA256, enc } from "crypto-js";
import { sign } from "jsonwebtoken";

import { CONFIG } from "../commons/config";
import { PROSTAVA, TELEGRAM } from "../constants";
import { SceneState, UpdateContext } from "../types";
import { ConverterUtils } from "./converter";
import { RegexUtils } from "./regex";

export class TelegramUtils {
    static fillCommandFakeUpdate(
        chatId: number,
        userId: number | undefined,
        command: string,
        is_bot = false,
        commandText?: string
    ): Update.MessageUpdate {
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
                    id: userId || 0,
                    is_bot: is_bot,
                    first_name: ""
                },
                text: commandText ? `/${command} ${commandText}` : `/${command}`,
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

    static getChatFromContext(ctx: UpdateContext) {
        return ctx.chat || ctx.session?.chat;
    }
    static getUserFromContext(ctx: UpdateContext) {
        return ctx.callbackQuery?.from || ctx.from;
    }
    static getProstavaFromContext(ctx: UpdateContext) {
        return ctx.prostava;
    }

    static getActionDataFromCbQuery(ctx: UpdateContext) {
        return ConverterUtils.parseActionData(this.getCbQueryData(ctx));
    }
    static getActionDataFromSceneState(ctx: UpdateContext) {
        return ConverterUtils.parseActionData(this.getSceneState(ctx).actionData);
    }
    static getDateTextFromCalendarAction(ctx: UpdateContext) {
        return ConverterUtils.sliceCalendarActionDate(TelegramUtils.getCbQueryData(ctx));
    }

    static isMessageProstavaCommand(ctx: UpdateContext) {
        return this.isProstavaCommand(this.getMessageCommand(ctx));
    }
    static includesCommand(ctx: UpdateContext, command: string) {
        if (this.isMessageCommand(ctx)) {
            return this.includesMessageCommand(ctx, command);
        }
        return this.includesSceneCommand(ctx, command);
    }
    static isMessageCommand(ctx: UpdateContext, command?: string) {
        const messageCommand = this.getMessageCommand(ctx);
        return command ? messageCommand === command : Boolean(messageCommand);
    }
    private static includesMessageCommand(ctx: UpdateContext, command: string) {
        return this.getTextMessage(ctx)?.text.includes(command);
    }
    private static includesSceneCommand(ctx: UpdateContext, command: string) {
        return this.getSceneState(ctx).command?.includes(command);
    }
    static isProstavaCommand(command: string | undefined) {
        return command === PROSTAVA.COMMAND.PROSTAVA || command === PROSTAVA.COMMAND.REQUEST;
    }

    static getSceneCommand(ctx: UpdateContext) {
        return this.getSceneState(ctx).command;
    }
    static setSceneState(ctx: UpdateContext, sceneState: SceneState) {
        const sceneStateNew = { ...this.getSceneState(ctx), ...sceneState };
        ctx.scene.state = sceneStateNew;
    }
    static getSceneState(ctx: UpdateContext) {
        return ctx.scene.state as SceneState;
    }

    static getMessageCommand(ctx: UpdateContext) {
        const command = this.getTextMessage(ctx)?.text?.match(RegexUtils.matchCommand());
        return command ? command[0].slice(1).replace(RegexUtils.matchUser(), "") : undefined;
    }
    static getMessageCommandText(ctx: UpdateContext) {
        return this.getTextMessage(ctx)?.text?.replace(RegexUtils.matchCommand(), "").trim();
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

    static checkTelegramUserAuth(authUser: Record<string, unknown>): boolean {
        const data_check_string = Object.entries(authUser)
            .filter((a) => a[0] !== "hash")
            .sort((a, b) => (a[0] !== b[0] ? (a[0] < b[0] ? -1 : 1) : 0))
            .map((a) => `${a[0]}=${a[1]}`)
            .join("\n");
        const secret_key = SHA256(CONFIG.TELEGRAM_TOKEN!);
        const hash = HmacSHA256(data_check_string, secret_key);
        return authUser["hash"] === hash.toString(enc.Hex);
    }
    static signTelegramUser(authUser: Record<string, unknown>): { user: Record<string, unknown>; token: string } {
        const user = { ...authUser };
        delete user["hash"];
        delete user["auth_date"];
        return { user: user, token: sign(user, CONFIG.TELEGRAM_TOKEN!) };
    }

    static getUserString(user: User | undefined): string {
        if (!user) {
            return "";
        }
        if (user.username) {
            return user.username;
        }
        return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }

    static isChatGroup(chat: Chat): boolean {
        return chat.type === TELEGRAM.CHAT_TYPE.GROUP || chat.type === TELEGRAM.CHAT_TYPE.SUPERGROUP;
    }
    static isMemberAdmin(member: ChatMember): boolean {
        return (
            member.user.id === CONFIG.SUPER_ADMIN_ID ||
            member.status === TELEGRAM.MEMBER_STATUS.OWNER ||
            member.status === TELEGRAM.MEMBER_STATUS.ADMIN
        );
    }
    static isUserReal(user: User | undefined): boolean {
        return !user?.is_bot;
    }
    static isUserProstavaBot(bot: User, user: User | undefined): boolean {
        return Boolean(user?.is_bot && user?.id === bot.id);
    }
}
