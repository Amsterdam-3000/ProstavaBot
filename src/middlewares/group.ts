import { PROSTAVA } from "../constants";
import { GroupCollection } from "../models";
import { GroupDocument, UpdateContext } from "../types";
import { ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";

export class GroupMiddleware {
    static async addGroupToContext(ctx: UpdateContext, next: Function) {
        const chat = TelegramUtils.getChatFromContext(ctx);
        ctx.group = await GroupCollection.findById(chat.id).exec();
        if (!ctx.group) {
            ctx.group = new GroupCollection({
                _id: chat.id,
                settings: {
                    chat_members_count: (await ctx.getChatMembersCount()) - 1
                }
            });
        } else {
            ProstavaUtils.populateGroupProstavas(ctx.group);
        }
        await next();
    }

    static async applyGroupSettings(ctx: UpdateContext, next: Function) {
        ctx.i18n.locale(ctx.group.settings.language);
        await next();
    }
    static async saveGroup(ctx: UpdateContext, next: Function) {
        if ((ctx.group as GroupDocument).isModified()) {
            try {
                await (ctx.group as GroupDocument).save();
                ProstavaUtils.populateGroupProstavas(ctx.group);
            } catch {
                //TODO Logger
                return;
            }
        }
        await next();
    }

    static async changeLanguage(ctx: UpdateContext, next: Function) {
        const actionData = ObjectUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        if (actionData.value === ctx.i18n.languageCode) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.language = actionData.value;
        await next();
    }
    static async changeCurrency(ctx: UpdateContext, next: Function) {
        const actionData = ObjectUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        if (actionData.value === ctx.group.settings.currency) {
            ctx.answerCbQuery();
            return;
        }
        ctx.group.settings.currency = actionData.value;
        await next();
    }
    static async changeSettings(ctx: UpdateContext, next: Function) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        const inputNumber = Number(TelegramUtils.getTextMessage(ctx).text);
        switch (ObjectUtils.parseActionData(sceneState.actionData)?.action) {
            case PROSTAVA.ACTION.SETTINGS_DAYS:
                ctx.group.settings.create_days_ago = inputNumber;
                break;
            case PROSTAVA.ACTION.SETTINGS_COUNT:
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
}
