import { Request, Response, NextFunction } from "express";
import { GroupDocument } from "../types";
import { GroupUtils, UserUtils } from "../utils";

export class ApiGroupMiddleware {
    static async addGroupToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        let group: GroupDocument | null;
        try {
            group = await GroupUtils.getGroupByChatIdFromDB(Number(req.params.groupId));
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
            return;
        }
        //Group NOT FOUND
        if (!group) {
            //TODO Add message?
            res.sendStatus(404);
            return;
        }
        req.group = group;
        //Check Group auth
        if (!UserUtils.findUserByUserId(req.group.users, req.user!.id)) {
            //TODO Add message?
            res.sendStatus(403);
            return;
        }
        GroupUtils.populateGroupProstavas(req.group);
        next();
    }
}
