import { Scenes } from "telegraf";
import { PROSTAVA } from "../constants";
import { CommonController, SettingsController } from "../controllers";
import { CommonMiddleware, GroupMiddleware, UserMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.COMMAND.SETTINGS);

settingsScene.enter(SettingsController.showSettings);

//Language
settingsScene.action(
    RegexUtils.matchAction(PROSTAVA.ACTION.SETTINGS_LANGUAGE),
    UserMiddleware.isUserAdmin,
    CommonMiddleware.isCbMessageOrigin,
    SettingsController.showLanguages
);
settingsScene.action(
    RegexUtils.matchSubAction(PROSTAVA.ACTION.SETTINGS_LANGUAGE),
    UserMiddleware.isUserAdmin,
    CommonMiddleware.isCbMessageOrigin,
    GroupMiddleware.changeLanguage,
    GroupMiddleware.applyGroupSettings,
    GroupMiddleware.saveGroup,
    SettingsController.showLanguages
);

//Currency
settingsScene.action(
    RegexUtils.matchAction(PROSTAVA.ACTION.SETTINGS_CURRENCY),
    UserMiddleware.isUserAdmin,
    CommonMiddleware.isCbMessageOrigin,
    SettingsController.showCurrencies
);
settingsScene.action(
    RegexUtils.matchSubAction(PROSTAVA.ACTION.SETTINGS_CURRENCY),
    UserMiddleware.isUserAdmin,
    CommonMiddleware.isCbMessageOrigin,
    GroupMiddleware.changeCurrency,
    GroupMiddleware.saveGroup,
    SettingsController.showCurrencies
);

//Days Count Percentage Hours
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_DAYS);
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_COUNT);
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_PERCENTAGE);
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_HOURS);
settingsScene.hears(
    RegexUtils.matchNumber(),
    CommonMiddleware.checkStateAction([
        PROSTAVA.ACTION.SETTINGS_DAYS,
        PROSTAVA.ACTION.SETTINGS_COUNT,
        PROSTAVA.ACTION.SETTINGS_PERCENTAGE,
        PROSTAVA.ACTION.SETTINGS_HOURS
    ]),
    GroupMiddleware.changeSettings,
    GroupMiddleware.saveGroup,
    CommonController.enterScene(PROSTAVA.COMMAND.SETTINGS)
);

//Back
settingsScene.action(
    RegexUtils.matchAction(PROSTAVA.ACTION.BACK),
    UserMiddleware.isUserAdmin,
    CommonMiddleware.isCbMessageOrigin,
    SettingsController.backToSettings
);

settingsScene.leave(CommonController.hideScene);
