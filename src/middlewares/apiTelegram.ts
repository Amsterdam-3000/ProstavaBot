import { NextFunction, Request, Response } from "express";

import { bot } from "../commons/bot";
import { TelegramUtils } from "../utils";

export class ApiTelegramMiddleware {
    static async addMemberDataToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.user) {
            const chatMember = await bot.telegram.getChatMember(req.group._id, req.user.id);
            req.user.is_admin = TelegramUtils.isMemberAdmin(chatMember);
        }
        next();
    }

    static async addChatDataToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.chat = { chat_member_count: await bot.telegram.getChatMembersCount(req.group._id) };
        next();
    }
}
