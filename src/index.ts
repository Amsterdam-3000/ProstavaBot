import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { PROSTAVA } from "./constants";
import { UserMiddleware, GroupMiddleware, GlobalMiddleware, CommonMiddleware, ProstavaMiddleware } from "./middlewares";
import { CommonController, HelpController, ProfileController, ProstavaController } from "./controllers";
import { RegexUtils } from "./utils";
import { prostavaQueue } from "./commons/queue";
import { ProstavaProcess } from "./processes";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    //Global middlewares
    bot.use(GlobalMiddleware.addSessionToContext);
    bot.use(GlobalMiddleware.isGroupChat);
    bot.use(GlobalMiddleware.isUserReal);
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
    bot.settings(GlobalMiddleware.isUserAdmin, CommonController.enterScene(PROSTAVA.COMMAND.SETTINGS));

    //User
    bot.command(PROSTAVA.COMMAND.PROFILE, CommonController.enterScene(PROSTAVA.COMMAND.PROFILE));
    bot.command([PROSTAVA.COMMAND.PROFILES, PROSTAVA.COMMAND.PROFILES_ME], ProfileController.showProfiles);

    //Prostava
    bot.command(PROSTAVA.COMMAND.PROSTAVA, CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA));
    bot.command(
        PROSTAVA.COMMAND.PROSTAVA_UNDO,
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.withdrawProstava,
        ProstavaMiddleware.saveProstava,
        CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
    );
    bot.command(
        PROSTAVA.COMMAND.PROSTAVA_SAVE,
        CommonMiddleware.leaveSceneAfter,
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.isProstavaPendingCompleted,
        ProstavaMiddleware.publishProstava,
        ProstavaMiddleware.saveProstava,
        ProstavaController.showProstava
    );
    bot.action(
        RegexUtils.matchSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
        ProstavaMiddleware.addProstavaFromActionToContext,
        ProstavaMiddleware.isUserParticipantOfProstava,
        ProstavaMiddleware.changeProstavaParticipantRating,
        ProstavaMiddleware.saveProstava,
        ProstavaController.refreshProstava
    );

    //Search prostavas
    bot.on("inline_query", ProstavaController.showQueryProstavas);

    //Launch
    bot.launch();
    bot.catch((err) => console.log(err));
    console.log("Prostava is polling");

    //Background jobs
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH, ProstavaProcess.publishCompletedProstavas);
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_RATE_REMINDER, ProstavaProcess.remindUsersRateProstavas);

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
