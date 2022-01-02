import { Scenes } from "telegraf";

import { PROSTAVA } from "../constants";
import { CommonController, StatsController } from "../controllers";
import { CommonMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";
import { CommonScene } from "./common";

export const statsScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.STATS);

statsScene.enter(StatsController.showTotalStats);
statsScene.use(CommonMiddleware.isCbMessageOrigin);

statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_RATING_TOTAL), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_RATING_AVERAGE), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_RATING_MAX), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_RATING_MIN), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_NUMBER_APPROVED), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_NUMBER_REJECTED), StatsController.showStats);
statsScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS), StatsController.showStats);

//Exit
CommonScene.actionExit(statsScene);
//Hide
statsScene.leave(CommonController.hideScene);
