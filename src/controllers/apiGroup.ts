import { Request, Response } from "express";

import { GroupDocument, Prostava, User } from "../types";
import { GroupUtils, ApiUtils, UserUtils } from "../utils";

export class ApiGroupController {
    static async getGroups(req: Request, res: Response): Promise<void> {
        try {
            const groups: GroupDocument[] = await GroupUtils.getGroupsByUserIdFromDB(req.user!.id);
            res.json(groups.map((group) => ApiUtils.convertGroupToObject(group)));
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async getGroup(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.convertGroupToApi(req.group, req.chat, req.user!.is_admin!));
    }

    static async getGroupUsers(req: Request, res: Response): Promise<void> {
        res.json(
            UserUtils.filterRealUsers(req.group.users).map((user) =>
                ApiUtils.convertUserToApi(user, user.user_id === req.user?.id)
            )
        );
    }
    static async getGroupProstavas(req: Request, res: Response): Promise<void> {
        res.json(
            (req.group.prostavas as Prostava[]).map((prostava) =>
                ApiUtils.convertProstavaToApi(
                    prostava,
                    (prostava.author as User)?.user_id === req.user?.id,
                    (prostava.creator as User)?.user_id === req.user?.id
                )
            )
        );
    }
}
