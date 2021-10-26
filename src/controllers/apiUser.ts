import { Request, Response } from "express";

import { ApiUtils } from "../utils";

export class ApiUserController {
    static async getUser(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.convertUserToApi(req.groupUser));
    }
}
