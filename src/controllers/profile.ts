import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, TelegramUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async showProfile(ctx: UpdateContext) {
        ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
            ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
        ).then((message) => TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message)));
    }
}
