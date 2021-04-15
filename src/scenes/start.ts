import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { CommonController } from "../controllers";
import { UpdateContext } from "../types";

export const startScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.COMMAND.START);

//Redirect to Help Scene
startScene.enter(CommonController.enterScene(PROSTAVA.COMMAND.HELP));
