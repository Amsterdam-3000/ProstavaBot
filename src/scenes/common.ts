import { Scenes } from "telegraf";
import { CommonController } from "../controllers";
import { CommonMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";

export class CommonScene {
    static actionInputRequest(scene: Scenes.BaseScene<UpdateContext>, action: string) {
        scene.action(
            RegexUtils.matchAction(action),
            CommonMiddleware.isCbMessageOrigin,
            CommonMiddleware.saveActionDataToState,
            CommonController.showActionCbMessage(action)
        );
    }
}
