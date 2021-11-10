import { Request, Response, NextFunction } from "express";

import { ParamsDictionary } from "express-serve-static-core";
import { RegexUtils, UserUtils } from "../utils";
import { ApiUser } from "../types";

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

    static async canUpdateUser(
        req: Request<ParamsDictionary, null, ApiUser>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        //TODO Send Message?
        //Name
        if (!req.body.name || !RegexUtils.matchTitle().test(req.body.name)) {
            res.sendStatus(406);
            return;
        }
        //Emoji
        if (!req.body.emoji || !RegexUtils.matchOneEmoji().test(req.body.emoji)) {
            res.sendStatus(406);
            return;
        }
        //Birthday
        if (!req.body.birthday || isNaN(new Date(req.body.birthday).getTime())) {
            res.sendStatus(406);
            return;
        }
        next();
    }
}
