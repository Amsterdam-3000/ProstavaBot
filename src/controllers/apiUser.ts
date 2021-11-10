import { Request, Response } from "express";

import { ApiUser } from "../types";
import { ApiUtils, UserUtils } from "../utils";

export class ApiUserController {
    static async getUser(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.convertUserToApi(req.groupUser, req.groupUser.user_id !== req.user?.id));
    }

    static async updateUser(
        req: Request<Record<string, unknown>, Record<string, unknown>, ApiUser>,
        res: Response
    ): Promise<void> {
        req.groupUser.personal_data = ApiUtils.convertApiToUserPersonalData(req.body);
        if (!UserUtils.isUserModified(req.groupUser)) {
            //TODO Message?
            res.sendStatus(406);
            return;
        }
        try {
            await UserUtils.saveUser(req.groupUser);
            res.json(ApiUtils.convertUserToApi(req.groupUser, req.groupUser.user_id !== req.user?.id));
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
}
