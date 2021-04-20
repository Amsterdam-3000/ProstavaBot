import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import { PROSTAVA } from "../constants";
import { ProstavaDocument, UpdateContext, User } from "../types";
import { DateUtils, LocaleUtils, ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProstavaView } from "../views";

export class ProstavaController {
    static async showProstava(ctx: UpdateContext) {
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
            TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
        } else if (ProstavaUtils.isProstavaPending(prostava)) {
            const message = await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
                parse_mode: "HTML",
                reply_markup: ProstavaView.getProstavaRatingKeyboard(prostava).reply_markup
            });
            TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
            ctx.pinChatMessage(message.message_id).catch((err) => console.log(err));
        } else {
            await ctx.reply(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
                parse_mode: "HTML"
            });
        }
    }

    static async showQueryProstavas(ctx: UpdateContext) {
        const results: InlineQueryResultArticle[] = [];
        const prostavas = ProstavaUtils.filterProstavasByQuery(ctx.group.prostavas, ctx.inlineQuery?.query);
        for (let i = 0; i < prostavas?.length; i++) {
            const prostava = prostavas[i];
            const user = prostava.author as User;
            results.push({
                type: "article",
                id: (prostava as ProstavaDocument).id,
                thumb_url: prostava.prostava_data.venue?.thumb,
                title: prostava.prostava_data.title!,
                description: `${user.personal_data.emoji} ${user.personal_data.name}\n${DateUtils.getDateString(
                    ctx.i18n.languageCode,
                    prostava.prostava_data.date
                )}`,
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
