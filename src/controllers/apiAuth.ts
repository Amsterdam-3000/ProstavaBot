import { Request, Response } from "express";
import { URLSearchParams } from "url";

import { TelegramUtils } from "../utils";

export class ApiAuthController {
    static async loginToProstavaApp(req: Request, res: Response): Promise<void> {
        if (!TelegramUtils.checkTelegramUserAuth(req.body)) {
            res.sendStatus(401);
            return;
        }
        res.json(TelegramUtils.signTelegramUser(req.body));
    }

    static async loginToProstavaWebApp(req: Request, res: Response): Promise<void> {
        const initData = new URLSearchParams(req.body["initData"]);
        if (!TelegramUtils.checkTelegramWebAppUserAuth(Object.fromEntries(initData))) {
            res.sendStatus(401);
            return;
        }
        res.json(TelegramUtils.signTelegramUser(JSON.parse(initData.get("user") || "")));
    }
}
