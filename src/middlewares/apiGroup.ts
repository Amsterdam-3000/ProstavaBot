import { Request, Response, NextFunction } from "express";
import momentTZ from "moment-timezone";

import { LOCALE, CODE } from "../constants";
import { GroupDocument } from "../types";
import { ApiUtils, GroupUtils, RegexUtils } from "../utils";

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
        GroupUtils.populateGroupProstavas(req.group);
        next();
    }

    static async addGroupSettingsFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.group.settings = ApiUtils.convertApiToGroupSettings(req.body);
        next();
    }

    static async canUpdateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        //TODO Send Message?
        //Name
        if (!req.group.settings.name || !RegexUtils.matchTitle().test(req.group.settings.name)) {
            res.sendStatus(406);
            return;
        }
        //Emoji
        if (!req.group.settings.emoji || !RegexUtils.matchOneEmoji().test(req.group.settings.emoji)) {
            res.sendStatus(406);
            return;
        }
        //Language
        if (!req.group.settings.language || !Object.values(LOCALE.LANGUAGE).includes(req.group.settings.language)) {
            res.sendStatus(406);
            return;
        }
        //Currency
        if (!req.group.settings.currency || !Object.values(CODE.CURRENCY).includes(req.group.settings.currency)) {
            res.sendStatus(406);
            return;
        }
        //Timezone
        if (!req.group.settings.timezone || !momentTZ.tz.names().includes(req.group.settings.timezone)) {
            res.sendStatus(406);
            return;
        }
        //Chat members count
        if (
            !req.group.settings.chat_members_count ||
            !RegexUtils.matchNumber().test(req.group.settings.chat_members_count.toString()) ||
            req.group.settings.chat_members_count > req.chat.chat_member_count
        ) {
            res.sendStatus(406);
            return;
        }
        //Create days ago
        if (
            !req.group.settings.create_days_ago ||
            !RegexUtils.matchNumber().test(req.group.settings.create_days_ago.toString())
        ) {
            res.sendStatus(406);
            return;
        }
        //Participants min percent
        if (
            !req.group.settings.participants_min_percent ||
            !RegexUtils.matchNumber().test(req.group.settings.participants_min_percent.toString()) ||
            req.group.settings.participants_min_percent > 100
        ) {
            res.sendStatus(406);
            return;
        }
        //Pending hours
        if (
            !req.group.settings.pending_hours ||
            !RegexUtils.matchNumber().test(req.group.settings.pending_hours.toString())
        ) {
            res.sendStatus(406);
            return;
        }
        //Prostava Types
        for (const requiredType of GroupUtils.getRequiredProstavaTypes()) {
            if (!req.group.settings.prostava_types.find((prostavaType) => prostavaType.emoji === requiredType.emoji)) {
                res.sendStatus(406);
                return;
            }
        }
        for (const prostavaType of req.group.settings.prostava_types) {
            if (!prostavaType.emoji || !RegexUtils.matchOneEmoji().test(prostavaType.emoji)) {
                res.sendStatus(406);
                return;
            }
            if (!prostavaType.text || !RegexUtils.matchTitle().test(prostavaType.text)) {
                res.sendStatus(406);
                return;
            }
        }
        next();
    }

    static async saveGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!GroupUtils.isGroupModified(req.group)) {
            next();
        }
        try {
            await GroupUtils.saveGroup(req.group);
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
}
