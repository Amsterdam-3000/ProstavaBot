import { CODE, PROSTAVA } from "../constants";
import { GroupCollection } from "../models";
import { GroupDocument, UpdateContext } from "../types";
import { ConverterUtils, ProstavaUtils, TelegramUtils } from "../utils";

export class GroupMiddleware {
    static async addGroupToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const chat = TelegramUtils.getChatFromContext(ctx);
        ctx.group = (await GroupCollection.findById(chat?.id).exec())!;
        if (!ctx.group) {
            ctx.group = new GroupCollection({
                _id: chat?.id,
                settings: {
                    chat_members_count: (await ctx.getChatMembersCount()) - 1,
                    prostava_types: ProstavaUtils.getRequiredProstavaTypes()
                }
            });
        } else {
            ProstavaUtils.populateGroupProstavas(ctx.group);
        }
        await next();
    }

    //Language and currency
    static async changeLanguage(ctx: UpdateContext, next: () => Promise<void>) {
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        if (actionData?.value === ctx.i18n.languageCode) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.language = actionData?.value || "";
        await next();
    }
    static async changeCurrency(ctx: UpdateContext, next: () => Promise<void>) {
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        if (actionData?.value === ctx.group.settings.currency) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.currency = actionData?.value || "";
        await next();
    }

    //Prostava type
    static async addNewProstavaType(ctx: UpdateContext, next: () => Promise<void>) {
        const prostavaType = {
            emoji: TelegramUtils.getTextMessage(ctx).text
        };
        if (!ctx.group.settings.prostava_types.length) {
            ctx.group.settings.prostava_types = [];
        }
        if (ctx.group.settings.prostava_types.find((type) => type.emoji === prostavaType.emoji)) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.prostava_types.push(prostavaType);
        await next();
    }
    static async changeOrDeleteProstavaType(ctx: UpdateContext, next: () => Promise<void>) {
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getSceneState(ctx).actionData);
        const inputText = TelegramUtils.getTextMessage(ctx).text;
        const prostavaType = ctx.group.settings.prostava_types.find((type) => type.emoji === actionData?.value);
        if (!prostavaType || prostavaType.text === inputText) {
            return;
        }
        if (inputText === CODE.TEXT_COMMAND.DELETE && !ProstavaUtils.canDeleteProstavaType(prostavaType)) {
            return;
        }
        if (inputText === CODE.TEXT_COMMAND.DELETE) {
            ctx.group.settings.prostava_types = ctx.group.settings.prostava_types.filter(
                (type) => type.emoji !== actionData?.value
            );
        } else {
            prostavaType.text = inputText;
        }
        await next();
    }

    //Others
    static async changeSettings(ctx: UpdateContext, next: () => Promise<void>) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        const inputNumber = Number(TelegramUtils.getTextMessage(ctx).text);
        switch (ConverterUtils.parseActionData(sceneState?.actionData)?.action) {
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

    static async applyGroupSettings(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.i18n.locale(ctx.group.settings.language);
        await next();
    }
    static async saveGroup(ctx: UpdateContext, next: () => Promise<void>) {
        await next();
        if ((ctx.group as GroupDocument).isModified()) {
            try {
                await (ctx.group as GroupDocument).save();
                ProstavaUtils.populateGroupProstavas(ctx.group);
            } catch (err) {
                console.log(err);
            }
        }
    }
}
