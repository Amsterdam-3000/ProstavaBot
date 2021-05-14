import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { profileScene } from "./profile";
import { profilesScene } from "./profiles";
import { prostavaScene } from "./prostava";
import { calendarScene } from "./calendar";
import { settingsScene } from "./settings";

export const mainStage = new Scenes.Stage<UpdateContext>(
    [settingsScene, profileScene, profilesScene, prostavaScene, calendarScene],
    {
        // ttl: 90000
    }
);
