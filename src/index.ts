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
    bot.use(GlobalMiddleware.addSessionToContext);
    bot.use(GlobalMiddleware.isGroupChat);
    bot.use(GlobalMiddleware.isUserReal);
    bot.use(GlobalMiddleware.addI18nToContext);
    bot.use(GroupMiddleware.addGroupToContext, GroupMiddleware.applyGroupSettings);
    bot.use(UserMiddleware.addUserToContext);
    bot.use(UserMiddleware.saveUser, GroupMiddleware.saveGroup);
    bot.use(GlobalMiddleware.addStageToContext);
    bot.use(GlobalMiddleware.addLoggingContext);
    bot.use(GlobalMiddleware.addChatToUserSession);

    bot.action(
        RegexUtils.matchSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
        ProstavaMiddleware.addProstavaFromActionToContext,
        ProstavaMiddleware.isUserParticipantOfProstava,
        ProstavaMiddleware.changeProstavaParticipantRating,
        ProstavaMiddleware.saveProstava,
        ProstavaController.refreshProstava
    );
    bot.use(CommonMiddleware.isCbMessageOrigin);

    bot.start(HelpController.showHelp);
    bot.help(HelpController.showHelp);
    bot.settings(CommonController.enterScene(PROSTAVA.COMMAND.SETTINGS));

    bot.command(PROSTAVA.COMMAND.PROFILE, CommonController.enterScene(PROSTAVA.COMMAND.PROFILE));
    bot.command(PROSTAVA.COMMAND.PROFILES, ProfileController.showProfiles);

    bot.command(PROSTAVA.COMMAND.PROSTAVA, CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA));
    bot.command(
        PROSTAVA.COMMAND.PROSTAVA_UNDO,
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.withdrawProstava,
        GroupMiddleware.saveGroup,
        CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
    );
    bot.command(
        PROSTAVA.COMMAND.PROSTAVA_SAVE,
        ProstavaMiddleware.addPendingProstavaToContext,
        ProstavaMiddleware.hasUserPendingProstava,
        ProstavaMiddleware.isProstavaPendingCompleted,
        ProstavaMiddleware.publishProstava,
        ProstavaMiddleware.saveProstava,
        CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
    );
    bot.on("inline_query", ProstavaController.showQueryProstavas);

    bot.launch();
    console.log("Prostava is polling");
    bot.catch((err) => console.log(err));

    //Background jobs
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH, ProstavaProcess.publishCompletedProstavas);
    prostavaQueue.process(PROSTAVA.JOB.PROSTAVA_RATE_REMINDER, ProstavaProcess.remindUsersRateProstavas);

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
