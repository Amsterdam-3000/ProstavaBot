import { Request, Response } from "express";

import { ApiUtils } from "../utils";

export class ApiProstavaController {
    static async getProstava(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.convertProstavaToApi(req.prostava, !!req.user?.is_author, !!req.user?.is_creator));
    }
}
