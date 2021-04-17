import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { HelpController } from "../controllers";
import { UpdateContext } from "../types";

export const helpScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.COMMAND.HELP);

helpScene.enter(HelpController.showHelp);
