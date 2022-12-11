import { NextFunction, Request, Response } from "express";

import { PROSTAVA } from "../constants";
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

    static executeBotCommandInChat =
        (command: string, commandText?: string) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            next();
            if (!req.user) {
                return;
            }
            let commandName = command;
            if (command === PROSTAVA.COMMAND.PROSTAVA && req.prostava?.is_request) {
                commandName = PROSTAVA.COMMAND.REQUEST;
            }
            bot.handleUpdate(
                TelegramUtils.fillCommandFakeUpdate(req.group._id, req.user.id, commandName, false, commandText)
            );
            if (req.query.fromWebApp) {
                bot.handleUpdate(
                    TelegramUtils.fillCommandFakeUpdate(req.user.id, req.user.id, commandName, false, commandText, true)
                );
            }
        };
}
