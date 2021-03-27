import { bot } from "./commons/bot";
import { db } from "./commons/db";
import { SCENE } from "./commons/constants";
import { getSceneController } from "./commons/util";
import { addI18n, addSession, addLog, isGroup, addAllScenes } from "./middlewares";

db.on("error", (err) => {
    //TODO Logger
    console.error.bind(console, "DB connection error:");
    process.exit(1);
});

db.once("open", () => {
    //Apply middlewares
    bot.use(addSession);
    bot.use(addLog);
    bot.use(addI18n);
    bot.use(isGroup);
    bot.use(addAllScenes);
    //Apply scenes
    bot.start(getSceneController(SCENE.START));
    bot.help(getSceneController(SCENE.HELP));
    bot.settings(getSceneController(SCENE.SETTINGS));
    //TODO custom commands
    // Launch bot
    bot.launch();
    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
