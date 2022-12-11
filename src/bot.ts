import { mongo } from "./commons/db";
import { bot } from "./commons/bot";
import { LOCALE, PROSTAVA } from "./constants";
import { UserMiddleware, GroupMiddleware, GlobalMiddleware, CommonMiddleware, ProstavaMiddleware } from "./middlewares";
import {
    CommonController,
    HelpController,
    ProfileController,
    ProstavaController,
    StatsController
} from "./controllers";
import { ConstantUtils, RegexUtils } from "./utils";
import { i18n } from "./commons/locale";
import { Scenes } from "telegraf";
import { UpdateContext } from "./types";

export function launchBot(): void {
    //Global middlewares
    bot.use(GlobalMiddleware.addSessionToContext(mongo.db));
    bot.use(GlobalMiddleware.addI18nToContext);
    bot.use(GlobalMiddleware.isUserRealOrProstavaBot);
    bot.use(GlobalMiddleware.isProstavaBotAndGroupChat);
    bot.use(
        GroupMiddleware.addGroupsToContext,
        GroupMiddleware.addGroupToContext,
        GroupMiddleware.applyGroupSettings,
        UserMiddleware.addUserToContext
    );
    bot.use(UserMiddleware.saveUser, GroupMiddleware.saveGroup);
    bot.use(GlobalMiddleware.addStageToContext);
    bot.use(GlobalMiddleware.addLoggingContext);
    bot.use(GroupMiddleware.addGroupIdToUserSession);

    //For unknown actions
    bot.use(CommonMiddleware.isCbMessageOrigin);

    //Bot
    bot.start(HelpController.showHelp);
    bot.help(HelpController.showHelp);
    bot.settings(GlobalMiddleware.isUserAdmin, CommonController.enterScene(PROSTAVA.SCENE.SETTINGS));

    //Group
    bot.command(
        PROSTAVA.COMMAND.GROUP,
        GlobalMiddleware.isPrivateChat,
        CommonController.enterScene(PROSTAVA.SCENE.GROUP)
    );

    //User
    bot.command(PROSTAVA.COMMAND.PROFILE, CommonController.enterScene(PROSTAVA.SCENE.PROFILE));
    bot.command(PROSTAVA.COMMAND.PROFILES, CommonController.enterScene(PROSTAVA.SCENE.PROFILES));
    bot.command(PROSTAVA.COMMAND.PROFILES_ME, ProfileController.showMyProfile);

    //Prostava
    bot.command(PROSTAVA.COMMAND.PROSTAVA, CommonController.enterScene(PROSTAVA.SCENE.PROSTAVA));
    bot.command(PROSTAVA.COMMAND.REQUEST, CommonController.enterScene(PROSTAVA.SCENE.PROSTAVA));
    bot.command(
        [PROSTAVA.COMMAND.PROSTAVA_UNDO, PROSTAVA.COMMAND.REQUEST_UNDO],
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.withdrawProstava,
        ProstavaMiddleware.saveProstava,
        CommonController.enterScene(PROSTAVA.SCENE.PROSTAVA)
    );
    bot.command(
        [PROSTAVA.COMMAND.PROSTAVA_SAVE, PROSTAVA.COMMAND.REQUEST_SAVE],
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.isProstavaPendingCompleted,
        ProstavaMiddleware.publishProstava,
        ProstavaMiddleware.saveProstava,
        ProstavaController.showProstava,
        Scenes.Stage.leave<UpdateContext>()
    );
    bot.command(
        [PROSTAVA.COMMAND.PROSTAVA_RATE, PROSTAVA.COMMAND.REQUEST_RATE],
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.hasProstavaUsersPendingToRate,
        ProstavaController.showProstavaUsersPendingToRate
    );
    bot.action(
        RegexUtils.matchSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
        ProstavaMiddleware.addProstavaFromRateActionToContext,
        ProstavaMiddleware.isUserParticipantOfProstava,
        ProstavaMiddleware.changeProstavaParticipantRating,
        ProstavaMiddleware.saveProstava,
        ProstavaController.refreshProstava
    );

    //Reminders and Calendar
    bot.command(
        PROSTAVA.COMMAND.REMINDERS,
        ProstavaMiddleware.addNewRequiredProstavasToContext,
        ProstavaController.showProstavas
    );
    bot.command(
        PROSTAVA.COMMAND.PROSTAVAS_REJECT,
        ProstavaMiddleware.addNewRequiredAndExpiredProstavasToContext,
        ProstavaMiddleware.hasProstavas,
        ProstavaMiddleware.rejectProstavas,
        ProstavaMiddleware.saveProstavas,
        ProstavaController.showProstavas
    );
    bot.command(PROSTAVA.COMMAND.CALENDAR, CommonController.enterScene(PROSTAVA.SCENE.CALENDAR));

    //Stats
    bot.command(PROSTAVA.COMMAND.STATS, CommonController.enterScene(PROSTAVA.SCENE.STATS));
    bot.command(PROSTAVA.COMMAND.STATS_TOTAL, StatsController.showTotalStats);

    //Search prostavas
    bot.on("inline_query", ProstavaMiddleware.addQueryProstavasToContext, ProstavaController.showQueryProstavas);

    //TODO Sync DB (Left members, new chat photo and etc.)
    // bot.on("");

    //Launch
    bot.launch();
    bot.catch((err) => console.log(err));
    console.log("Prostava Bot is polling");

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

export function setBotCommands(): void {
    Object.values(LOCALE.LANGUAGE).forEach((locale) => {
        const I18nContext = i18n.createContext(locale, {});
        bot.telegram.setMyCommands(ConstantUtils.getBotCommands(I18nContext), {
            scope: { type: "all_group_chats" },
            language_code: locale
        });
        bot.telegram.setMyCommands(ConstantUtils.getBotCommands(I18nContext, true), {
            scope: { type: "all_private_chats" },
            language_code: locale
        });
    });
}
