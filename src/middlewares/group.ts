import { CODE, PROSTAVA } from "../constants";
import { Group, UpdateContext } from "../types";
import { GroupUtils, TelegramUtils, RegexUtils, LocaleUtils, SessionUtils } from "../utils";

export class GroupMiddleware {
    static async addGroupToContext(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const chat = TelegramUtils.getChatFromContext(ctx);
        const chatId = TelegramUtils.isChatGroup(chat) ? chat?.id : TelegramUtils.getChatIdFromSession(ctx);
        let group: Group | null = null;
        if (chatId) {
            group = await GroupUtils.getGroupByChatIdFromDB(chatId);
        }
        if (!group && TelegramUtils.isChatGroup(chat) && chat) {
            const chatMembersCount = await ctx.getChatMembersCount();
            group = GroupUtils.createGroupForChat(chat, chatMembersCount);
        }
        if (!group && ctx.groups?.length) {
            group = ctx.groups[0];
            ctx.session.chat_id = group._id;
        }
        if (!group) {
            ctx.reply(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_GROUPS));
            return;
        }
        GroupUtils.populateGroupProstavas(group);
        ctx.group = group;
        await next();
    }
    static async addGroupsToContext(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const chat = TelegramUtils.getChatFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        if (TelegramUtils.isChatPrivate(chat) && user) {
            ctx.groups = await GroupUtils.getGroupsByUserIdFromDB(user.id);
        }
        await next();
    }
    static async changeGroup(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const groupId = Number(actionData?.value);
        if (groupId === ctx.group._id) {
            ctx.answerCbQuery();
            return;
        }
        const group = ctx.groups?.find((group) => group._id === groupId);
        if (!group) {
            ctx.answerCbQuery();
            return;
        }
        ctx.session.chat_id = groupId;
        GroupUtils.populateGroupProstavas(group);
        ctx.group = group;
        await next();
    }
    static async addGroupIdToUserSession(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        await next();
        if (!ctx.group) {
            return;
        }
        const user = TelegramUtils.getUserFromContext(ctx);
        //Save group id for future inline queries
        SessionUtils.saveChatIdToUserSession(user?.id, ctx.group._id);
    }

    //Emoji
    static async changeGroupEmoji(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        ctx.group.settings.emoji = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }

    //Language and currency
    static async changeLanguage(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        if (actionData?.value === ctx.i18n.languageCode) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.language = actionData?.value || "";
        await next();
    }
    static async changeCurrency(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        if (actionData?.value === ctx.group.settings.currency) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.currency = actionData?.value || "";
        await next();
    }

    //Prostava type
    static async addNewProstavaType(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const inputText = TelegramUtils.getTextMessage(ctx).text;
        const emoji = inputText.match(RegexUtils.matchEmoji());
        if (!emoji || ctx.group.settings.prostava_types.find((type) => type.emoji === emoji[0])) {
            ctx.answerCbQuery();
            return;
        }
        GroupUtils.addNewPostavaTypeFromText(ctx.group, inputText);
        await next();
    }
    static async changeOrDeleteProstavaType(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromSceneState(ctx);
        if (!actionData) {
            return;
        }
        const prostavaType = GroupUtils.findProstavaTypeByEmoji(ctx.group, actionData.value);
        if (!prostavaType) {
            return;
        }
        const inputText = TelegramUtils.getTextMessage(ctx).text;
        if (prostavaType.text === inputText) {
            return;
        }
        if (inputText === CODE.TEXT_COMMAND.DELETE && !GroupUtils.canDeleteProstavaType(prostavaType)) {
            return;
        }
        if (inputText === CODE.TEXT_COMMAND.DELETE) {
            GroupUtils.deleteProstavaTypeByEmoji(ctx.group, actionData.value);
        } else {
            prostavaType.text = inputText;
        }
        await next();
    }

    //Others
    static async changeSettings(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const inputNumber = Number(TelegramUtils.getTextMessage(ctx).text);
        switch (TelegramUtils.getActionDataFromSceneState(ctx)?.action) {
            case PROSTAVA.ACTION.SETTINGS_DAYS:
                ctx.group.settings.create_days_ago = inputNumber;
                break;
            case PROSTAVA.ACTION.SETTINGS_COUNT:
                const chatMembersCount = await ctx.getChatMembersCount();
                if (inputNumber > chatMembersCount) {
                    return;
                }
                ctx.group.settings.chat_members_count = inputNumber;
                break;
            case PROSTAVA.ACTION.SETTINGS_PERCENTAGE:
                if (inputNumber > 100) {
                    return;
                }
                ctx.group.settings.participants_min_percent = inputNumber;
                break;
            case PROSTAVA.ACTION.SETTINGS_HOURS:
                ctx.group.settings.pending_hours = inputNumber;
                break;
        }
        await next();
    }

    static async applyGroupSettings(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        ctx.i18n.locale(ctx.group.settings.language);
        await next();
    }
    static async saveGroup(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        await next();
        if (!ctx.group || !GroupUtils.isGroupModified(ctx.group)) {
            return;
        }
        await GroupUtils.saveGroup(ctx.group).catch((err) => console.log(err));
        GroupUtils.populateGroupProstavas(ctx.group);
    }
}
