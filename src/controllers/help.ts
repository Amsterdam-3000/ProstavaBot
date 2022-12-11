import { TelegramUtils } from "../utils";
import { UpdateContext } from "../types";
import { HelpView } from "../views";

export class HelpController {
    static async showHelp(ctx: UpdateContext): Promise<void> {
        const chat = TelegramUtils.getChatFromContext(ctx);
        await ctx.replyWithHTML(await HelpView.getHelpHtml(ctx.i18n, TelegramUtils.isChatPrivate(chat)));
    }
}
