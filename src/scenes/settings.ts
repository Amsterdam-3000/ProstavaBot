import { Scenes } from "telegraf";
import { ACTION, SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { isUserAdmin, applyGroupSettings, changeLanguage, saveGroupSettings } from "../middlewares";
import { hideSettings, showLanguages, showSettings } from "../controllers";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(SCENE.SETTINGS);

settingsScene.enter(showSettings);

settingsScene.action(ACTION.SHOW_LANGUAGES, isUserAdmin, showLanguages);
settingsScene.action(
    new RegExp(`${ACTION.CHANGE_LANGUAGE}`),
    isUserAdmin,
    changeLanguage,
    saveGroupSettings,
    applyGroupSettings,
    showLanguages
);

settingsScene.leave(hideSettings);
