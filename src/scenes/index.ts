import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { profileScene } from "./profile";
import { prostavaScene } from "./prostava";
import { settingsScene } from "./settings";

export const mainStage = new Scenes.Stage<UpdateContext>([settingsScene, profileScene, prostavaScene], {
    // ttl: 90000
});

export * from "./prostava";
