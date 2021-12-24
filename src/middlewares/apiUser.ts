import { Request, Response, NextFunction } from "express";

import { ApiUtils, RegexUtils, UserUtils } from "../utils";

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

    static async addUserPersonalDataFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.groupUser.personal_data = ApiUtils.convertApiToUserPersonalData(req.body);
        next();
    }

    static async canUpdateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        //TODO Send Message?
        //Name
        if (!req.groupUser.personal_data.name || !RegexUtils.matchTitle().test(req.groupUser.personal_data.name)) {
            res.sendStatus(406);
            return;
        }
        //Emoji
        if (!req.groupUser.personal_data.emoji || !RegexUtils.matchOneEmoji().test(req.groupUser.personal_data.emoji)) {
            res.sendStatus(406);
            return;
        }
        //Birthday
        if (!req.groupUser.personal_data.birthday || isNaN(new Date(req.groupUser.personal_data.birthday).getTime())) {
            res.sendStatus(406);
            return;
        }
        next();
    }

    static async saveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!UserUtils.isUserModified(req.groupUser)) {
            next();
        }
        try {
            await UserUtils.saveUser(req.groupUser);
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
}
