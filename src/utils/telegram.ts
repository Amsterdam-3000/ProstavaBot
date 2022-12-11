import { CallbackQuery, Chat, ChatMember, Message, Update, User } from "telegraf/typings/core/types/typegram";
import { SHA256, HmacSHA256, enc } from "crypto-js";
import { sign } from "jsonwebtoken";

import { CONFIG } from "../commons/config";
import { PROSTAVA, TELEGRAM } from "../constants";
import { ActionData, Prostava, SceneState, UpdateContext } from "../types";
import { ConverterUtils } from "./converter";
import { RegexUtils } from "./regex";

export class TelegramUtils {
    static fillCommandFakeUpdate(
        chatId: number,
        userId: number | undefined,
        command: string,
        is_bot = false,
        commandText?: string,
        isPrivateChat = false
    ): Update.MessageUpdate {
        return {
            update_id: 0,
            message: {
                message_id: 0,
                chat: isPrivateChat
                    ? {
                          id: chatId,
                          type: "private",
                          first_name: ""
                      }
                    : {
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

    static getChatFromContext(ctx: UpdateContext): Chat | undefined {
        return ctx.chat;
    }
    static getUserFromContext(ctx: UpdateContext): User | undefined {
        return ctx.callbackQuery?.from || ctx.from;
    }
    static getProstavaFromContext(ctx: UpdateContext): Prostava | undefined {
        return ctx.prostava;
    }
    static getChatIdFromSession(ctx: UpdateContext): number | undefined {
        return ctx.session?.chat_id;
    }

    static getActionDataFromCbQuery(ctx: UpdateContext): ActionData | undefined {
        return ConverterUtils.parseActionData(this.getCbQueryData(ctx));
    }
    static getActionDataFromSceneState(ctx: UpdateContext): ActionData | undefined {
        return ConverterUtils.parseActionData(this.getSceneState(ctx).actionData);
    }
    static getDateTextFromCalendarAction(ctx: UpdateContext): string {
        return ConverterUtils.sliceCalendarActionDate(TelegramUtils.getCbQueryData(ctx));
    }

    static isMessageProstavaCommand(ctx: UpdateContext): boolean {
        return this.isProstavaCommand(this.getMessageCommand(ctx));
    }
    static includesCommand(ctx: UpdateContext, command: string): boolean {
        if (this.isMessageCommand(ctx)) {
            return this.includesMessageCommand(ctx, command);
        }
        return this.includesSceneCommand(ctx, command);
    }
    static isMessageCommand(ctx: UpdateContext, command?: string): boolean {
        const messageCommand = this.getMessageCommand(ctx);
        return command ? messageCommand === command : Boolean(messageCommand);
    }
    private static includesMessageCommand(ctx: UpdateContext, command: string): boolean {
        return this.getTextMessage(ctx)?.text.includes(command);
    }
    private static includesSceneCommand(ctx: UpdateContext, command: string): boolean {
        return this.getSceneState(ctx) && this.getSceneState(ctx).command?.includes(command) ? true : false;
    }
    static isProstavaCommand(command: string | undefined): boolean {
        return command === PROSTAVA.COMMAND.PROSTAVA || command === PROSTAVA.COMMAND.REQUEST;
    }

    static getSceneCommand(ctx: UpdateContext): string | undefined {
        return this.getSceneState(ctx).command;
    }
    static setSceneState(ctx: UpdateContext, sceneState: SceneState): void {
        const sceneStateNew = { ...this.getSceneState(ctx), ...sceneState };
        ctx.scene.state = sceneStateNew;
    }
    static getSceneState(ctx: UpdateContext): SceneState {
        return ctx.scene.state as SceneState;
    }

    static getMessageCommand(ctx: UpdateContext): string | undefined {
        const command = this.getTextMessage(ctx)?.text?.match(RegexUtils.matchCommand());
        return command ? command[0].slice(1).replace(RegexUtils.matchUser(), "") : undefined;
    }
    static getMessageCommandText(ctx: UpdateContext): string {
        return this.getTextMessage(ctx)?.text?.replace(RegexUtils.matchCommand(), "").trim();
    }
    static getCbQueryData(ctx: UpdateContext): string {
        return (ctx.callbackQuery as CallbackQuery)?.data || "";
    }
    static getTextMessage(ctx: UpdateContext): Message.TextMessage {
        return ctx.message as Message.TextMessage;
    }
    static getVenueMessage(ctx: UpdateContext): Message.VenueMessage {
        return ctx.message as Message.VenueMessage;
    }
    static getLocationMessage(ctx: UpdateContext): Message.LocationMessage {
        return ctx.message as Message.LocationMessage;
    }

    static checkTelegramUserAuth(authUser: Record<string, unknown>): boolean {
        const data_check_string = ConverterUtils.convertObjectSortEntriesToString(authUser);
        const secret_key = SHA256(CONFIG.TELEGRAM_TOKEN || "");
        const hash = HmacSHA256(data_check_string, secret_key);
        return authUser["hash"] === hash.toString(enc.Hex);
    }
    static checkTelegramWebAppUserAuth(initData: Record<string, unknown>): boolean {
        const data_check_string = ConverterUtils.convertObjectSortEntriesToString(initData);
        const secret_key = HmacSHA256(CONFIG.TELEGRAM_TOKEN || "", "WebAppData");
        const hash = HmacSHA256(data_check_string, secret_key);
        return initData["hash"] === hash.toString(enc.Hex);
    }
    static signTelegramUser(authUser: Record<string, unknown>): string {
        const user = { ...authUser };
        delete user["hash"];
        delete user["auth_date"];
        return sign(user, CONFIG.TELEGRAM_TOKEN || "", { expiresIn: "3 days" });
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

    static isChatGroup(chat?: Chat): boolean {
        return !!chat && (chat.type === TELEGRAM.CHAT_TYPE.GROUP || chat.type === TELEGRAM.CHAT_TYPE.SUPERGROUP);
    }
    static isChatPrivate(chat?: Chat): boolean {
        return !!chat && chat.type === TELEGRAM.CHAT_TYPE.PRIVATE;
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
