import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ProstavaUtils, TelegramUtils, UserUtils } from "../utils";
import { ProfileView, ProstavaView } from "../views";

export class ProstavaController {
    static async showSelectProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (ctx.prostavas?.length && !prostava) {
            const message = await ctx.reply(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_PROSTAVA),
                ProstavaView.getProstavaKeyboard(ctx.i18n, ctx.prostavas)
            );
            TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
            return;
        }
        await next();
    }
    static async showCreateProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava && ProstavaUtils.isProstavaNew(prostava)) {
            const command = ProstavaUtils.getProstavaCommand(prostava);
            const message = await ctx.reply(
                LocaleUtils.getCommandText(ctx.i18n, command, ctx.user?.personal_data?.name),
                ProstavaView.getProstavaCreateKeyboard(
                    ctx.i18n,
                    prostava,
                    ProstavaUtils.canAnnounceProstava(prostava),
                    Number(ctx.prostavas?.length) > 1
                )
            );
            TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
            return;
        }
        await next();
    }
    static async showRateProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava && ProstavaUtils.isProstavaPending(prostava)) {
            const message = await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
                parse_mode: "HTML",
                reply_markup: ProstavaView.getProstavaRatingKeyboard(ctx.i18n, prostava).reply_markup
            });
            TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
            await ctx.pinChatMessage(message.message_id).catch((err) => console.log(err));
            return;
        }
        await next();
    }
    static async backToSelectProstava(ctx: UpdateContext) {
        if (!ctx.prostavas?.length) {
            await ctx.answerCbQuery();
            return;
        }
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_PROSTAVA),
                ProstavaView.getProstavaKeyboard(ctx.i18n, ctx.prostavas)
            )
            .catch((err) => console.log(err));
        TelegramUtils.setSceneState(ctx, { prostavaId: "" });
    }
    static async backToCreateProstava(ctx: UpdateContext) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            await ctx.answerCbQuery();
            return;
        }
        const command = ProstavaUtils.getProstavaCommand(prostava);
        await ctx
            .editMessageText(
                LocaleUtils.getCommandText(ctx.i18n, command, ctx.user?.personal_data?.name),
                ProstavaView.getProstavaCreateKeyboard(
                    ctx.i18n,
                    prostava,
                    ProstavaUtils.canAnnounceProstava(prostava),
                    Number(ctx.prostavas?.length) > 1
                )
            )
            .catch((err) => console.log(err));
    }
    static async refreshProstava(ctx: UpdateContext) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            await ctx.answerCbQuery();
            return;
        }
        await ctx
            .editMessageText(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
                parse_mode: "HTML",
                reply_markup: ProstavaView.getProstavaRatingKeyboard(ctx.i18n, prostava).reply_markup
            })
            .catch((err) => console.log(err));
    }
    static async showProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            return;
        }
        await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
            parse_mode: "HTML"
        });
        await next();
    }

    static async showProstavaAuthors(ctx: UpdateContext) {
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_AUTHOR),
                ProfileView.getUsersKeyboard(
                    ctx.i18n,
                    UserUtils.filterRealUsersExceptUserId(ctx.group.users, ctx.user.user_id)
                )
            )
            .catch((err) => console.log(err));
    }
    static async showProstavaTypes(ctx: UpdateContext) {
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_TYPE),
                ProstavaView.getProstavaTypeKeyboard(ctx.i18n, ctx.group.settings.prostava_types)
            )
            .catch((err) => console.log(err));
    }
    static async showProstavaCalendar(ctx: UpdateContext) {
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_DATE),
                ProstavaView.getProstavaCalendarKeyboard(ctx.i18n, ctx.group.settings)
            )
            .catch((err) => console.log(err));
    }

    static async showProstavaUsersPendingToRate(ctx: UpdateContext) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            return;
        }
        const users = ProstavaUtils.filterUsersPendingToRateProstava(ctx.group.users, prostava);
        if (!users?.length) {
            return;
        }
        await ctx.reply(await ProstavaView.getPendingUsersHtml(ctx.i18n, prostava, users), {
            parse_mode: "HTML",
            reply_to_message_id: TelegramUtils.getSceneState(ctx).messageId
        });
    }

    //Reminders and Calendar
    static async showProstavas(ctx: UpdateContext) {
        await ctx.reply(await ProstavaView.getProstavasHtml(ctx.i18n, ctx.prostavas), {
            parse_mode: "HTML"
        });
    }
    static async showCalendarOfProstavas(ctx: UpdateContext) {
        const prostavas = ProstavaUtils.filterScheduledProstavas(ctx.group.prostavas);
        const message = await ctx.reply(await ProstavaView.getProstavasHtml(ctx.i18n, ctx.prostavas, new Date()), {
            reply_markup: ProstavaView.getCalendarOfProstavasKeyboard(ctx.i18n, prostavas, ctx.group.users)
                .reply_markup,
            parse_mode: "HTML"
        });
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }
    static async refreshCalendarOfProstavas(ctx: UpdateContext, date: string) {
        const selectedDate = new Date(date);
        const prostavas = ProstavaUtils.filterScheduledProstavas(ctx.group.prostavas);
        await ctx.editMessageText(await ProstavaView.getProstavasHtml(ctx.i18n, ctx.prostavas, selectedDate), {
            reply_markup: ProstavaView.getCalendarOfProstavasKeyboard(
                ctx.i18n,
                prostavas,
                ctx.group.users,
                selectedDate
            ).reply_markup,
            parse_mode: "HTML"
        });
    }

    static async showQueryProstavas(ctx: UpdateContext) {
        if (!ctx.prostavas?.length) {
            await ctx.answerInlineQuery([]);
            return;
        }
        const results: InlineQueryResultArticle[] = [];
        for (const prostava of ctx.prostavas) {
            results.push({
                type: "article",
                id: ProstavaUtils.getProstavaId(prostava),
                thumb_url: prostava.prostava_data.venue?.thumb,
                title: ProstavaView.getProstavaTitle(ctx.i18n, prostava),
                description: ProstavaView.getProstavaDescription(ctx.i18n, prostava),
                input_message_content: {
                    message_text: await ProstavaView.getProstavaHtml(ctx.i18n, prostava),
                    parse_mode: "HTML"
                }
            });
        }
        await ctx.answerInlineQuery(results);
    }
}
