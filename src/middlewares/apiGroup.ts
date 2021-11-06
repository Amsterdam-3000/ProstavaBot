import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { bot } from "../commons/bot";
import momentTZ from "moment-timezone";

import { LOCALE, CODE } from "../constants";
import { ApiGroup, GroupDocument } from "../types";
import { GroupUtils, RegexUtils, UserUtils } from "../utils";

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
        //Add chat
        req.chat = { chat_member_count: await bot.telegram.getChatMembersCount(req.group._id) };
        next();
    }

    static async canUpdateGroup(
        req: Request<ParamsDictionary, null, ApiGroup>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        //TODO Send Message?
        //Name
        if (!req.body.name || !RegexUtils.matchTitle().test(req.body.name)) {
            res.sendStatus(406);
        }
        //Emoji
        if (!req.body.emoji || !RegexUtils.matchOneEmoji().test(req.body.emoji)) {
            res.sendStatus(406);
        }
        //Language
        if (!req.body.language || !Object.values(LOCALE.LANGUAGE).includes(req.body.language)) {
            res.sendStatus(406);
        }
        //Currency
        if (!req.body.currency || !Object.values(CODE.CURRENCY).includes(req.body.currency)) {
            res.sendStatus(406);
        }
        //Timezone
        if (!req.body.timezone || !momentTZ.tz.names().includes(req.body.timezone)) {
            res.sendStatus(406);
        }
        //Chat members count
        if (
            !req.body.chat_members_count ||
            !RegexUtils.matchNumber().test(req.body.chat_members_count.toString()) ||
            req.body.chat_members_count > req.chat.chat_member_count
        ) {
            res.sendStatus(406);
        }
        //Create days ago
        if (!req.body.create_days_ago || !RegexUtils.matchNumber().test(req.body.create_days_ago.toString())) {
            res.sendStatus(406);
        }
        //Participants min percent
        if (
            !req.body.participants_min_percent ||
            !RegexUtils.matchNumber().test(req.body.participants_min_percent.toString()) ||
            req.body.participants_min_percent > 100
        ) {
            res.sendStatus(406);
        }
        //Pending hours
        if (!req.body.pending_hours || !RegexUtils.matchNumber().test(req.body.pending_hours.toString())) {
            res.sendStatus(406);
        }
        //Prostava Types
        for (const requiredType of GroupUtils.getRequiredProstavaTypes()) {
            if (!req.body.prostava_types.find((prostavaType) => prostavaType.emoji === requiredType.emoji)) {
                res.sendStatus(406);
                break;
            }
        }
        for (const prostavaType of req.body.prostava_types) {
            if (!prostavaType.emoji || !RegexUtils.matchOneEmoji().test(prostavaType.emoji)) {
                res.sendStatus(406);
            }
            if (!prostavaType.name || !RegexUtils.matchTitle().test(prostavaType.name)) {
                res.sendStatus(406);
            }
            if (res.statusCode > 200) {
                break;
            }
        }
        //Exit
        if (res.statusCode > 200) {
            return;
        }
        next();
    }
}
