import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import { PROSTAVA } from "../constants";
import { ProstavaDocument, UpdateContext } from "../types";
import { LocaleUtils, ConverterUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProstavaView } from "../views";

export class ProstavaController {
    static async showCreateOrRateProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            return;
        }
        if (ProstavaUtils.isProstavaNew(prostava)) {
            const message = await ctx.reply(
                LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROSTAVA, ctx.user?.personal_data?.name),
                ProstavaView.getProstavaCreateKeyboard(
                    ctx.i18n,
                    prostava.prostava_data,
                    !(prostava as ProstavaDocument).validateSync()
                )
            );
            TelegramUtils.setSceneStateToContext(ctx, ConverterUtils.initializeState(message));
        } else if (ProstavaUtils.isProstavaPending(prostava)) {
            const message = await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
                parse_mode: "HTML",
                reply_markup: ProstavaView.getProstavaRatingKeyboard(prostava).reply_markup
            });
            TelegramUtils.setSceneStateToContext(ctx, ConverterUtils.initializeState(message));
            ctx.pinChatMessage(message.message_id).catch((err) => console.log(err));
        }
    }
    static async showProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            return;
        }
        await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
            parse_mode: "HTML"
        });
    }

    static async showQueryProstavas(ctx: UpdateContext) {
        const results: InlineQueryResultArticle[] = [];
        const prostavas = ProstavaUtils.filterProstavasByQuery(ctx.group.prostavas, ctx.inlineQuery?.query);
        for (const prostava of prostavas) {
            results.push({
                type: "article",
                id: (prostava as ProstavaDocument).id,
                thumb_url: prostava.prostava_data.venue?.thumb,
                title: ProstavaView.getProstavaTitle(ctx.i18n, prostava),
                description: ProstavaView.getProstavaDescription(ctx.i18n, prostava),
                input_message_content: {
                    message_text: await ProstavaView.getProstavaHtml(ctx.i18n, prostava),
                    parse_mode: "HTML"
                }
            });
        }
        ctx.answerInlineQuery(results, {
            cache_time: 1
        });
    }

    static async showProstavaTypes(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_TYPE),
            ProstavaView.getProstavaTypeKeyboard(
                ctx.i18n,
                ctx.group.settings.prostava_types,
                prostava?.prostava_data.type
            )
        ).catch((err) => console.log(err));
    }
    static async showProstavaCalendar(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_DATE),
            ProstavaView.getProstavaCalendarKeyboard(ctx.i18n, ctx.group.settings)
        ).catch((err) => console.log(err));
    }

    static async refreshProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            ctx.answerCbQuery();
            return;
        }
        ctx.editMessageText(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
            parse_mode: "HTML",
            reply_markup: ProstavaView.getProstavaRatingKeyboard(prostava).reply_markup
        }).catch((err) => console.log(err));
    }
    static async backToCreateProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            ctx.answerCbQuery();
            return;
        }
        ctx.editMessageText(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROSTAVA, ctx.user?.personal_data?.name),
            ProstavaView.getProstavaCreateKeyboard(
                ctx.i18n,
                prostava.prostava_data,
                !(prostava as ProstavaDocument).validateSync()
            )
        ).catch((err) => console.log(err));
    }
}
