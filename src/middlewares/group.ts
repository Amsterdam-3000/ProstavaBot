import { CODE, PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { GroupUtils, TelegramUtils, RegexUtils } from "../utils";

export class GroupMiddleware {
    static async addGroupToContext(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const chat = TelegramUtils.getChatFromContext(ctx);
        if (!chat) {
            return;
        }
        const group = await GroupUtils.getGroupByChatIdFromDB(chat.id);
        if (group) {
            GroupUtils.populateGroupProstavas(group);
            ctx.group = group;
        } else {
            const chatMembersCount = await ctx.getChatMembersCount();
            ctx.group = GroupUtils.createGroupForChat(chat, chatMembersCount);
        }
        await next();
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
