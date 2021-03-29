import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { addI18n, addSession, addLog, addMainStage, addGroup } from "./middlewares";
import { enterHelpScene, enterSettingsScene, enterStartScene } from "./controllers";

db.on("error", (err) => {
    //TODO Logger
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    //Add Global Session to Context
    bot.use(addSession);
    //Add Global I18N to Context
    bot.use(addI18n);
    //Add Main Stage to Context
    bot.use(addMainStage);
    //Add Logging
    bot.use(addLog);
    //Add Group to Global Session
    bot.use(addGroup);
    //Enter Start Scene
    bot.start(enterStartScene);
    //Enter Help Scene
    bot.help(enterHelpScene);
    //Enter Settings Scene
    bot.settings(enterSettingsScene);
    //TODO Custom commands
    //Launch bot
    bot.launch();
    //Catch errors
    //TODO Logger
    bot.catch((err) => console.log(err));
    //Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
