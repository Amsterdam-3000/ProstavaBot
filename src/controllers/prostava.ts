import { PROSTAVA } from "../constants";
import { ProstavaDocument, UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProstavaView } from "../views";

export class ProstavaController {
    static async showProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        if (ProstavaUtils.isProstavaNew(prostava)) {
            ctx.reply(
                LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROSTAVA, TelegramUtils.getUserString(user)),
                ProstavaView.getProstavaCreateKeyboard(
                    ctx.i18n,
                    prostava.prostava_data,
                    !(prostava as ProstavaDocument).validateSync()
                )
            ).then((message) => TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message)));
        } else if (ProstavaUtils.isProstavaPending(prostava)) {
            ctx.replyWithHTML(
                await ProstavaView.getProstavaHtml(ctx.i18n, prostava, user),
                ProstavaView.getProstavaRatingKeyboard(ctx.i18n, prostava)
            ).then((message) => {
                TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
                //TODO Logger
                ctx.pinChatMessage(message.message_id).catch(err => console.log(err));
            });
        } else {
        }
    }

    static async showProstavaCalendar(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.PROSTAVA_DATE),
            ProstavaView.getProstavaCalendarKeyboard(ctx.i18n, ctx.group.settings)
        );
    }

    static async refreshProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.editMessageText(
            await ProstavaView.getProstavaHtml(ctx.i18n, prostava, user),
            ProstavaView.getProstavaRatingKeyboard(ctx.i18n, prostava)
        );
    }
    static async backToCreateProstava(ctx: UpdateContext) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.editMessageText(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROSTAVA, TelegramUtils.getUserString(user)),
            ProstavaView.getProstavaCreateKeyboard(
                ctx.i18n,
                prostava.prostava_data,
                !(prostava as ProstavaDocument).validateSync()
            )
        );
    }
}
