import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { profileScene } from "./profile";
import { profilesScene } from "./profiles";
import { prostavaScene } from "./prostava";
import { calendarScene } from "./calendar";
import { settingsScene } from "./settings";
import { statsScene } from "./stats";

export const mainStage = new Scenes.Stage<UpdateContext>(
    [settingsScene, profileScene, profilesScene, prostavaScene, calendarScene, statsScene],
    {
        // ttl: 90000
    }
);
