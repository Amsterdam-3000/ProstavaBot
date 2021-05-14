import { Scenes } from "telegraf";
import { CODE, PROSTAVA } from "../constants";
import { CommonController, SettingsController } from "../controllers";
import { CommonMiddleware, GroupMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.SETTINGS);

settingsScene.enter(SettingsController.showSettings);
settingsScene.use(CommonMiddleware.isCbMessageOrigin, GroupMiddleware.saveGroup);

//Language
settingsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.SETTINGS_LANGUAGE), SettingsController.showLanguages);
settingsScene.action(
    RegexUtils.matchSubAction(PROSTAVA.ACTION.SETTINGS_LANGUAGE),
    GroupMiddleware.changeLanguage,
    GroupMiddleware.applyGroupSettings,
    SettingsController.showLanguages
);

//Currency
settingsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.SETTINGS_CURRENCY), SettingsController.showCurrencies);
settingsScene.action(
    RegexUtils.matchSubAction(PROSTAVA.ACTION.SETTINGS_CURRENCY),
    GroupMiddleware.changeCurrency,
    SettingsController.showCurrencies
);

//Prostava types
settingsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.SETTINGS_TYPE), SettingsController.showProstavaTypes);
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_TYPENEW);
settingsScene.hears(
    RegexUtils.matchOneEmoji(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.SETTINGS_TYPENEW]),
    GroupMiddleware.addNewProstavaType,
    SettingsController.showProstavaTypes
);
CommonScene.actionInputRequest(settingsScene, PROSTAVA.ACTION.SETTINGS_TYPEDIT, CODE.TEXT_COMMAND.DELETE);
settingsScene.hears(
    RegexUtils.matchTitle(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.SETTINGS_TYPEDIT]),
    GroupMiddleware.changeOrDeleteProstavaType,
    SettingsController.showProstavaTypes
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
    CommonController.enterScene(PROSTAVA.SCENE.SETTINGS)
);

//Back
CommonScene.actionBack(settingsScene, SettingsController.backToSettings);
//Exit
CommonScene.actionExit(settingsScene);
//Hide
settingsScene.leave(CommonController.hideScene);
