import { Request, Response } from "express";
import { GroupDocument, User } from "../types";
import { GroupUtils } from "../utils";

export class ApiGroupController {
    static async getGroups(req: Request, res: Response): Promise<void> {
        try {
            const groups: GroupDocument[] = await GroupUtils.getGroupsByUserIdFromDB(req.user!.id);
            res.json(
                groups.map((group) => ({
                    id: group._id,
                    name: group.settings.name,
                    photo: group.group_photo
                }))
            );
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async getGroup(req: Request, res: Response): Promise<void> {
        res.json({
            id: req.group._id,
            ...req.group.settings,
            photo: req.group.group_photo
        });
    }
    static async getGroupUsers(req: Request, res: Response): Promise<void> {
        res.json(
            (req.group.users as User[]).map((user) => ({
                id: user.user_id,
                name: user.personal_data.name,
                photo: user.user_photo,
                link: user.user_link
            }))
        );
    }
}
