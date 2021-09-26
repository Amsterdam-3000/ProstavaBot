import { Request, Response } from "express";
import { TelegramUtils } from "../utils";

export class AuthController {
    static async loginToProstavaWeb(req: Request, res: Response): Promise<void> {
        if (!TelegramUtils.checkTelegramUserAuth(req.body)) {
            res.sendStatus(401);
            return;
        }
        res.json(TelegramUtils.signTelegramUser(req.body));
    }
}
