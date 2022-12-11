import { Scenes } from "telegraf";

import { PROSTAVA } from "../constants";
import { CommonController, GroupController } from "../controllers";
import { CommonMiddleware, GroupMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const groupScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.GROUP);

groupScene.enter(GroupController.showCurrentGroup);
groupScene.use(CommonMiddleware.isCbMessageOrigin);

groupScene.action(
    RegexUtils.matchAction(PROSTAVA.ACTION.GROUP_GROUP),
    GroupMiddleware.changeGroup,
    GroupMiddleware.applyGroupSettings,
    GroupController.showSelectedGroup
);

//Exit
CommonScene.actionExit(groupScene);
//Hide
groupScene.leave(CommonController.hideScene);
