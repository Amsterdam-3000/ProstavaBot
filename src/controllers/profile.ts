import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, TelegramUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async showProfile(ctx: UpdateContext) {
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, TelegramUtils.getUserString(user)),
            ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
        ).then((message) => TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message)));
    }
}
