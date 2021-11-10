import expressJwt from "express-jwt";
import { TelegramUtils } from "../utils";

import { CONFIG } from "../commons/config";
import { bot } from "../commons/bot";
import { NextFunction, Request, Response } from "express";

export class ApiAuthMiddleware {
    static checkUserAuth = expressJwt({ secret: CONFIG.TELEGRAM_TOKEN!, algorithms: ["HS256"] });

    static isUserAdmin =
        (adminRequired = false) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const chatMember = await bot.telegram.getChatMember(req.group._id, req.user!.id);
            req.user!.is_admin = TelegramUtils.isMemberAdmin(chatMember);
            if (adminRequired && !req.user?.is_admin) {
                //TODO Add message?
                res.sendStatus(403);
                return;
            }
            next();
        };

    static async isUserMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.groupUser.user_id !== req.user?.id) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }
}
