import { Request, Response } from "express";

import { ApiGroup, GroupDocument, User } from "../types";
import { GroupUtils, ApiUtils } from "../utils";

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
        res.json(ApiUtils.convertGroupToApi(req.group));
    }
    static async updateGroup(
        req: Request<Record<string, unknown>, Record<string, unknown>, ApiGroup>,
        res: Response
    ): Promise<void> {
        //TODO Checks
        req.group.settings = ApiUtils.convertApiToGroupSettings(req.body);
        if (!GroupUtils.isGroupModified(req.group)) {
            //TODO Status?
            return;
        }
        try {
            await GroupUtils.saveGroup(req.group);
            res.json(ApiUtils.convertGroupToApi(req.group));
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async getGroupUsers(req: Request, res: Response): Promise<void> {
        res.json((req.group.users as User[]).map((user) => ApiUtils.convertUserToObject(user)));
    }

    static async getGroupLanguages(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.getLanguageObjects(req.i18n));
    }
    static async getGroupCurrencies(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.getCurrencyObjects(req.i18n));
    }
}
