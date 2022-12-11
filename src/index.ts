import { mongo } from "./commons/db";
import { launchBot, setBotCommands } from "./bot";
import { launchServer } from "./api";
import { launchJobs } from "./job";

mongo.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

mongo.once("open", () => {
    setBotCommands();
    launchBot();
    launchServer();
    launchJobs();
});
