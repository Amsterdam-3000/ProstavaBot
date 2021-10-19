import { Request, Response } from "express";

export class ApiUserController {
    static async getUser(req: Request, res: Response): Promise<void> {
        res.json({
            id: req.groupUser.user_id,
            ...req.groupUser.personal_data,
            photo: req.groupUser.user_photo,
            link: req.groupUser.user_link
        });
    }
}
