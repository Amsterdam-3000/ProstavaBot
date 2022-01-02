import { PROSTAVA } from "../constants";
import { Scenes } from "telegraf";
import { CommonController } from "../controllers";
import { CommonMiddleware } from "../middlewares";
import { UpdateContext } from "../types";
import { RegexUtils } from "../utils";

export class CommonScene {
    static actionInputRequest(scene: Scenes.BaseScene<UpdateContext>, action: string, value?: string): void {
        scene.action(
            RegexUtils.matchAction(action),
            CommonMiddleware.saveActionDataToState,
            CommonController.showActionCbMessage(action, value)
        );
    }

    static actionExit(scene: Scenes.BaseScene<UpdateContext>): void {
        scene.action(RegexUtils.matchAction(PROSTAVA.ACTION.EXIT), Scenes.Stage.leave<UpdateContext>());
    }
    static actionBack(scene: Scenes.BaseScene<UpdateContext>, controller: (ctx: UpdateContext) => Promise<void>): void {
        scene.action(RegexUtils.matchAction(PROSTAVA.ACTION.BACK), controller);
    }
}
