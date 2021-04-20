import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { helpScene } from "./help";
import { profileScene } from "./profile";
import { prostavaScene } from "./prostava";
import { settingsScene } from "./settings";
import { startScene } from "./start";

export const mainStage = new Scenes.Stage<UpdateContext>(
    [startScene, helpScene, settingsScene, profileScene, prostavaScene],
    {
        // ttl: 90000
    }
);

export * from "./prostava";
