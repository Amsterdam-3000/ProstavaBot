import { Scenes } from "telegraf";
import { ACTION, SCENE } from "../commons/constants";
import { UpdateContext } from "../types";
import { isUserAdmin, applyGroupSettings, changeLanguage, saveGroupSettings } from "../middlewares";
import { backToSettings, forbidAction, hideScene, showLanguages, showSettings } from "../controllers";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(SCENE.SETTINGS);

settingsScene.enter(showSettings, (ctx) => console.log(ctx));

settingsScene.action(ACTION.SHOW_LANGUAGES, isUserAdmin, showLanguages);
settingsScene.action(
    new RegExp(`${ACTION.CHANGE_LANGUAGE}`),
    isUserAdmin,
    changeLanguage,
    saveGroupSettings,
    applyGroupSettings,
    showLanguages
);
settingsScene.action(ACTION.BACK, isUserAdmin, backToSettings);

settingsScene.leave(hideScene);

settingsScene.action(/./, forbidAction);
