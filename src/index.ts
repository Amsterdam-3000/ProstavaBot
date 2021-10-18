import { db } from "./commons/db";
import { launchBot } from "./bot";
import { launchServer } from "./api";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    launchBot();
    launchServer();
});
