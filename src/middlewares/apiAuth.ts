import { NextFunction, Request, Response } from "express";
import expressJwt from "express-jwt";

import { CONFIG } from "../commons/config";
import { UserUtils } from "../utils";

export class ApiAuthMiddleware {
    static checkUserAuth = expressJwt({ secret: CONFIG.TELEGRAM_TOKEN || "", algorithms: ["HS256"] });

    static async isUserAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!req.user || !req.user.is_admin) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }

    static async isUserMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!req.user || req.groupUser.user_id !== req.user.id) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }

    static async isMyGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!req.user || !UserUtils.findUserByUserId(req.group.users, req.user.id)) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }

    static async isProstavaAnnouncerMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (
            !req.user ||
            (req.prostava.is_request && !req.user.is_creator) ||
            (!req.prostava.is_request && !req.user.is_author)
        ) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        next();
    }
}
