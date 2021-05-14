import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { CommonController, ProfileController } from "../controllers";
import { CommonMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const profilesScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.PROFILES);

profilesScene.enter(ProfileController.showProfiles);
profilesScene.use(CommonMiddleware.isCbMessageOrigin);

profilesScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.PROFILES_USER), ProfileController.showProfile);

//Back
CommonScene.actionBack(profilesScene, ProfileController.backToProfiles);
//Exit
CommonScene.actionExit(profilesScene);
//Hide
profilesScene.leave(CommonController.hideScene);
