import { InlineQueryResultPhoto } from "telegraf/typings/core/types/typegram";
import { PROSTAVA } from "../constants";
import { ProstavaDocument, UpdateContext, User } from "../types";
import { DateUtils, LocaleUtils, ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProstavaView } from "../views";

export class ProstavaController {
    static async showProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);

        if (ProstavaUtils.isProstavaNew(prostava)) {
            ctx.reply(
                LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROSTAVA, ctx.user?.personal_data?.name),
                ProstavaView.getProstavaCreateKeyboard(
                    ctx.i18n,
                    prostava.prostava_data,
                    !(prostava as ProstavaDocument).validateSync()
                )
            ).then((message) => TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message)));
        } else if (ProstavaUtils.isProstavaPending(prostava)) {
            ctx.replyWithPhoto(
                { url: prostava.prostava_data.venue.url },
                {
                    caption: await ProstavaView.getProstavaHtml(ctx.i18n, prostava),
                    reply_markup: ProstavaView.getProstavaRatingKeyboard(prostava).reply_markup,
                    parse_mode: "HTML"
                }
            ).then((message) => {
                TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
                ctx.pinChatMessage(message.message_id).catch((err) => console.log(err));
            });
        } else {
            ctx.replyWithHTML(await ProstavaView.getProstavaHtml(ctx.i18n, prostava));
        }
    }
    static async showProstavas(ctx: UpdateContext) {
        let results: InlineQueryResultPhoto[] = [];
        const prostavas = ProstavaUtils.filterProstavasByQuery(ctx.group.prostavas, ctx.inlineQuery.query);
        for (let i = 0; i < prostavas?.length; i++) {
            const prostava = prostavas[i];
            const user = prostava.author as User;
            results.push({
                type: "photo",
                id: (prostava as ProstavaDocument).id,
                thumb_url: prostava.prostava_data.venue.url,
                photo_url: prostava.prostava_data.venue.url,
                title: prostava.prostava_data.title,
                description: `${user.personal_data.emoji} ${user.personal_data.name}\n${DateUtils.getDateString(
                    ctx.i18n.languageCode,
                    prostava.prostava_data.date
                )}`,
                parse_mode: "HTML",
                caption: await ProstavaView.getProstavaHtml(ctx.i18n, prostava)
            });
        }
        ctx.answerInlineQuery(results);
    }

    static async showProstavaCalendar(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_DATE),
            ProstavaView.getProstavaCalendarKeyboard(ctx.i18n, ctx.group.settings)
        ).catch((err) => console.log(err));
    }

    static async refreshProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.editMessageCaption(await ProstavaView.getProstavaHtml(ctx.i18n, prostava), {
            parse_mode: "HTML",
            reply_markup: ProstavaView.getProstavaRatingKeyboard(prostava).reply_markup
        }).catch((err) => console.log(err));
    }
    static async backToCreateProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
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
