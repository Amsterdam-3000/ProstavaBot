import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { COMMAND } from "./commons/constants";
import {
    addI18nToContext,
    addSessionToContext,
    addUpdateLogging,
    addStageToSession,
    addGroupToSession,
    isGroupChat,
    addHelpToContext,
    applyGroupSettings,
    addUserToSession
} from "./middlewares";
import { enterHelpScene, enterSettingsScene, enterStartScene, enterProfileScene, forbidAction } from "./controllers";

db.on("error", (err) => {
    //TODO Logger
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    bot.use(addSessionToContext);
    bot.use(addI18nToContext);
    bot.use(addStageToSession);
    bot.use(isGroupChat, addGroupToSession, applyGroupSettings);
    bot.use(addHelpToContext);
    bot.use(addUserToSession);
    bot.use(addUpdateLogging);

    bot.start(enterStartScene);
    bot.help(enterHelpScene);
    bot.settings(enterSettingsScene);
    bot.command(COMMAND.PROFILE, enterProfileScene);
    bot.action(/./, forbidAction);

    //Launch bot
    bot.launch();
    //Catch errors
    //TODO Logger
    bot.catch((err) => console.log(err));

    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
