import { Request, Response, NextFunction } from "express";
import { bot } from "../commons/bot";

import { UserUtils, TelegramUtils } from "../utils";

export class ApiUserMiddleware {
    static async addUserToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = UserUtils.findUserByUserId(req.group.users, Number(req.params.userId || req.user!.id));
        if (!user) {
            //TODO Add message?
            res.sendStatus(404);
            return;
        }
        req.groupUser = user;
        next();
    }

    static async isUserAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        const chatMember = await bot.telegram.getChatMember(req.group._id, req.user!.id);
        if (!TelegramUtils.isMemberAdmin(chatMember)) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }
}
