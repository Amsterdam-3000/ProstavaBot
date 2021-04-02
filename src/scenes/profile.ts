import { Scenes } from "telegraf";
import { ACTION, SCENE } from "../commons/constants";
import { UpdateContext } from "../types";
import {
    changeUserBirthday,
    changeUserEmoji,
    checkStateAction,
    isMessageOrigin,
    saveActionDataToState,
    saveUserPersonalData
} from "../middlewares";
import {
    enterProfileScene,
    forbidAction,
    hideScene,
    showBirthdayMessage,
    showEmojiMessage,
    showProfile
} from "../controllers";
import { emojiRegex } from "../commons/utils";

export const profileScene = new Scenes.BaseScene<UpdateContext>(SCENE.PROFILE);

profileScene.enter(showProfile);

//Emoji
profileScene.action(new RegExp(`${ACTION.SET_EMOJI}`), isMessageOrigin, saveActionDataToState, showEmojiMessage);
profileScene.hears(
    new RegExp(`^(${emojiRegex().source})$`),
    checkStateAction(ACTION.SET_EMOJI),
    changeUserEmoji,
    saveUserPersonalData,
    enterProfileScene
);

//Birthday
profileScene.action(new RegExp(`${ACTION.SET_BIRTHDAY}`), isMessageOrigin, saveActionDataToState, showBirthdayMessage);
profileScene.hears(
    /^\d{4}-\d{2}-\d{2}$/,
    checkStateAction(ACTION.SET_BIRTHDAY),
    // checkDate,
    changeUserBirthday,
    saveUserPersonalData,
    enterProfileScene
);

profileScene.leave(hideScene);

profileScene.action(/./, forbidAction);
