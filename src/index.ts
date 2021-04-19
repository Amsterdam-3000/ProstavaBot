import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { PROSTAVA } from "./constants";
import { UserMiddleware, GroupMiddleware, GlobalMiddleware, CommonMiddleware, ProstavaMiddleware } from "./middlewares";
import { CommonController, ProstavaController } from "./controllers";
import { RegexUtils } from "./utils";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    console.log("bot is ready");

    bot.use(GlobalMiddleware.addSessionToContext);
    bot.use(GlobalMiddleware.isGroupChat);
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

    bot.start(CommonController.enterScene(PROSTAVA.COMMAND.START));
    bot.help(CommonController.enterScene(PROSTAVA.COMMAND.HELP));
    bot.settings(CommonController.enterScene(PROSTAVA.COMMAND.SETTINGS));

    bot.command(PROSTAVA.COMMAND.PROFILE, CommonController.enterScene(PROSTAVA.COMMAND.PROFILE));

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
    bot.catch((err) => console.log(err));

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
