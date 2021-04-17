import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { CommonController, ProfileController } from "../controllers";
import { CommonMiddleware, UserMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const profileScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.COMMAND.PROFILE);

profileScene.enter(ProfileController.showProfile);

//Emoji
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_EMOJI)
profileScene.hears(
    RegexUtils.matchEmojis(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_EMOJI]),
    UserMiddleware.changeUserEmoji,
    UserMiddleware.saveUser,
    CommonController.enterScene(PROSTAVA.COMMAND.PROFILE)
);

//Birthday
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_BIRTHDAY)
profileScene.hears(
    RegexUtils.matchDate(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_BIRTHDAY]),
    UserMiddleware.changeUserBirthday,
    UserMiddleware.saveUser,
    CommonController.enterScene(PROSTAVA.COMMAND.PROFILE)
);

//Username
CommonScene.actionInputRequest(profileScene, PROSTAVA.ACTION.PROFILE_USERNAME)
profileScene.hears(
    RegexUtils.matchTitle(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROFILE_USERNAME]),
    UserMiddleware.changeUserName,
    UserMiddleware.saveUser,
    CommonController.enterScene(PROSTAVA.COMMAND.PROFILE)
);


profileScene.leave(CommonController.hideScene);
