import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { CommonController, ProfileController } from "../controllers";
import { CommonMiddleware, UserMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const profileScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.PROFILE);

profileScene.enter(ProfileController.completeProfile);
profileScene.use(CommonMiddleware.isCbMessageOrigin, UserMiddleware.saveUser);

//Emoji
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_EMOJI);
profileScene.hears(
    RegexUtils.matchOneEmoji(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_EMOJI]),
    UserMiddleware.changeUserEmoji,
    CommonController.enterScene(PROSTAVA.SCENE.PROFILE)
);

//Birthday
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_BIRTHDAY);
profileScene.hears(
    RegexUtils.matchDate(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_BIRTHDAY]),
    UserMiddleware.changeUserBirthday,
    CommonController.enterScene(PROSTAVA.SCENE.PROFILE)
);

//Username
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_USERNAME);
profileScene.hears(
    RegexUtils.matchTitle(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_USERNAME]),
    UserMiddleware.changeUserName,
    CommonController.enterScene(PROSTAVA.SCENE.PROFILE)
);

//Exit
CommonScene.actionExit(profileScene);
//Hide
profileScene.leave(CommonController.hideScene);
