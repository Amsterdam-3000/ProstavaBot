import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { PROSTAVA } from "./constants";
import { UserMiddleware, GroupMiddleware, GlobalMiddleware, CommonMiddleware, ProstavaMiddleware } from "./middlewares";
import { CommonController, HelpController, ProstavaController } from "./controllers";
import { RegexUtils } from "./utils";
import { prostavaQueue } from "./commons/queue";
import { GroupProcess, ProstavaProcess, UserProcess } from "./processes";
import { Scenes } from "telegraf";
import { UpdateContext } from "./types";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    //Global middlewares
    bot.use(GlobalMiddleware.addSessionToContext);
    bot.use(GlobalMiddleware.isGroupChat);
    bot.use(GlobalMiddleware.isUserRealOrProstavaBot);
    bot.use(GlobalMiddleware.addI18nToContext);
    bot.use(GroupMiddleware.addGroupToContext, GroupMiddleware.applyGroupSettings, UserMiddleware.addUserToContext);
    bot.use(UserMiddleware.saveUser, GroupMiddleware.saveGroup);
    bot.use(GlobalMiddleware.addStageToContext);
    bot.use(GlobalMiddleware.addLoggingContext);
    bot.use(GlobalMiddleware.addChatToUserSession);

    //For unknown actions
    bot.use(CommonMiddleware.isCbMessageOrigin);

    //Bot
    bot.start(HelpController.showHelp);
    bot.help(HelpController.showHelp);
    bot.settings(GlobalMiddleware.isUserAdmin, CommonController.enterScene(PROSTAVA.SCENE.SETTINGS));

    //User
    bot.command(PROSTAVA.COMMAND.PROFILE, CommonController.enterScene(PROSTAVA.SCENE.PROFILE));
    bot.command(PROSTAVA.COMMAND.PROFILES, CommonController.enterScene(PROSTAVA.SCENE.PROFILES));
    bot.command(PROSTAVA.COMMAND.PROFILES_ME, CommonController.enterScene(PROSTAVA.SCENE.PROFILES));

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
        ProstavaMiddleware.addAllNewProstavasToContext,
        ProstavaController.showProstavas
    );
    bot.command(PROSTAVA.COMMAND.CALENDAR, CommonController.enterScene(PROSTAVA.SCENE.CALENDAR));

    //Search prostavas
    bot.on("inline_query", ProstavaMiddleware.addQueryProstavasToContext, ProstavaController.showQueryProstavas);

    //Launch
    bot.launch();
    bot.catch((err) => console.log(err));
    console.log("Prostava is polling");

    //Background jobs
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH, ProstavaProcess.publishOrWithdrawCompletedProstavas);
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_RATE_REMINDER, ProstavaProcess.remindUsersRateProstavas);
    prostavaQueue.process(PROSTAVA.JOB.USER_BIRTHDAY_REMINDER, UserProcess.announceReuestsForBithdayUsers);
    prostavaQueue.process(PROSTAVA.JOB.GROUP_SYNC_CALENDAR, GroupProcess.updateGroupCalendarsOfProstavas);

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
