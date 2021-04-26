import Bull from "bull";
import { Group, ProstavaStatus, User } from "../types";
import { GroupCollection, ProstavaCollection } from "../models";
import { LocaleUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { PROSTAVA } from "../constants";
import { bot } from "../commons/bot";
import { i18n } from "../commons/locale";
import { cache } from "../commons/cache";

export class ProstavaProcess {
    static async publishCompletedProstavas(job: Bull.Job) {
        const completedProstavas = await ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$status", ProstavaStatus.Pending] },
                    {
                        $or: [
                            { $lte: ["$closing_date", new Date()] },
                            { $eq: [{ $size: "$participants" }, "$participants_max_count"] }
                        ]
                    }
                ]
            }
        })
            .populate("author")
            .exec();
        for (const prostava of completedProstavas) {
            const author = prostava.author as User;
            bot.handleUpdate(
                TelegramUtils.fillCommandFakeUpdate(PROSTAVA.COMMAND.PROSTAVA_SAVE, prostava.group_id, author.user_id)
            );
        }
    }

    static async remindUsersRateProstavas(job: Bull.Job) {
        const pendingProstavas = await ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$status", ProstavaStatus.Pending] },
                    { $lt: [{ $size: "$participants" }, "$participants_max_count"] }
                ]
            }
        })
            .populate("author")
            .populate("participants.user")
            .exec();
        for (const prostava of pendingProstavas) {
            const author = prostava.author as User;
            //TODO mb lookup? And need switch off autopopulate prostavas!
            const group = (await GroupCollection.findById(prostava.group_id).exec()) as Group;
            const users = ProstavaUtils.filterUsersPendingToRateProstava(group?.users, prostava);
            if (!users?.length) {
                continue;
            }
            //TODO bug in module typings getSession!
            const ctx = TelegramUtils.fillFakeContext(prostava.group_id, (prostava.author as User).user_id);
            await cache.middleware()(ctx, async () => {});
            bot.telegram.sendMessage(
                group._id,
                LocaleUtils.getActionReplyText(
                    i18n.createContext(group.settings.language, {}),
                    PROSTAVA.ACTION.PROSTAVA_RATING,
                    ProstavaUtils.getUsersLinkMarkdown(users)
                ),
                {
                    parse_mode: "MarkdownV2",
                    //TODO bug in module typings getSession!
                    reply_to_message_id: ctx.session.__scenes.state.message.message_id
                }
            );
        }
    }
}
