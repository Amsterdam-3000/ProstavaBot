import { TelegramUtils } from "../utils";
import { UpdateContext } from "../types";
import { GroupView } from "../views";

export class GroupController {
    static async showCurrentGroup(ctx: UpdateContext): Promise<void> {
        const message = await ctx.replyWithPhoto(ctx.group.group_photo || "", {
            reply_markup: GroupView.getGroupsKeyboard(ctx.i18n, ctx.group._id, ctx.groups).reply_markup,
            caption: ctx.group.settings.name,
            parse_mode: "HTML"
        });
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }
    static async showSelectedGroup(ctx: UpdateContext): Promise<void> {
        try {
            await ctx.editMessageMedia(
                {
                    type: "photo",
                    media: ctx.group.group_photo || "",
                    caption: ctx.group.settings.name,
                    parse_mode: "HTML"
                },
                {
                    reply_markup: GroupView.getGroupsKeyboard(ctx.i18n, ctx.group._id, ctx.groups).reply_markup
                }
            );
        } catch {
            ctx.answerCbQuery();
        }
    }
}
