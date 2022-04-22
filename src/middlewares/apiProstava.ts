import { Request, Response, NextFunction } from "express";
import momentTZ from "moment-timezone";

import { CODE } from "../constants";
import { ApiProstava, User } from "../types";
import { ProstavaUtils, RegexUtils, UserUtils } from "../utils";

export class ApiProstavaMiddleware {
    static async addProstavaToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        const prostava =
            ProstavaUtils.findProstavaById(req.group.prostavas, req.params.prostavaId) ||
            ProstavaUtils.createProstavaFromText(
                req.group,
                req.groupUser,
                "",
                Boolean(req.query.isRequest || req.body.is_request),
                req.body.id
            );
        if (!prostava) {
            //TODO Add message?
            res.sendStatus(404);
            return;
        }
        req.prostava = prostava;
        if (!ProstavaUtils.isProstavaExists(req.prostava)) {
            req.group.prostavas.push(req.prostava);
        }
        if (req.user) {
            req.user.is_author = (req.prostava.author as User)?.user_id === req.user.id;
            req.user.is_creator = (req.prostava.creator as User)?.user_id === req.user.id;
        }
        next();
    }

    static async isProstavaExists(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!ProstavaUtils.isProstavaExists(req.prostava)) {
            //TODO Add message?
            res.sendStatus(404);
            return;
        }
        next();
    }

    static async addProstavaDataFromBody(
        req: Request<Record<string, string>, Record<string, string>, ApiProstava>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        req.prostava.prostava_data.title = req.body.name;
        req.prostava.prostava_data.type = req.body.emoji || "";
        const author = UserUtils.findUserByUserId(req.group.users, Number(req.body.author.id));
        if (req.prostava.is_request && author) {
            req.prostava.author = author;
        } else {
            req.prostava.prostava_data.date = req.body.date;
            req.prostava.prostava_data.timezone = req.body.timezone;
            req.prostava.prostava_data.cost = {
                currency: req.body.currency,
                amount: req.body.amount
            };
            req.prostava.prostava_data.venue = {
                title: req.body.venue.name || "",
                address: req.body.venue.address,
                location: {
                    latitude: req.body.venue.latitude,
                    longitude: req.body.venue.longitude
                }
            };
        }
        next();
    }

    static async canAnnounceProstava(req: Request, res: Response, next: NextFunction): Promise<void> {
        //TODO Send Message?
        //Name
        if (!req.prostava.prostava_data.title || !RegexUtils.matchTitle().test(req.prostava.prostava_data.title)) {
            res.sendStatus(406);
            return;
        }
        //Type
        if (!req.prostava.prostava_data.type || !RegexUtils.matchOneEmoji().test(req.prostava.prostava_data.type)) {
            res.sendStatus(406);
            return;
        }
        //Request
        if (req.prostava.is_request) {
            // Author
            if (!req.prostava.author) {
                res.sendStatus(406);
                return;
            }
        } else {
            //Date
            if (!req.prostava.prostava_data.date || isNaN(new Date(req.prostava.prostava_data.date).getTime())) {
                res.sendStatus(406);
                return;
            }
            //Timezone
            if (
                !req.prostava.prostava_data.timezone ||
                !momentTZ.tz.names().includes(req.prostava.prostava_data.timezone)
            ) {
                res.sendStatus(406);
                return;
            }
            //Amount
            if (
                !req.prostava.prostava_data.cost?.amount ||
                !RegexUtils.matchNumber().test(req.prostava.prostava_data.cost.amount.toString())
            ) {
                res.sendStatus(406);
                return;
            }
            //Currency
            if (
                !req.prostava.prostava_data.cost?.currency ||
                !Object.values(CODE.CURRENCY).includes(req.prostava.prostava_data.cost.currency)
            ) {
                res.sendStatus(406);
                return;
            }
            //Venue
            if (
                !req.prostava.prostava_data.venue ||
                !req.prostava.prostava_data.venue.title ||
                !RegexUtils.matchTitle().test(req.prostava.prostava_data.venue.title) ||
                !req.prostava.prostava_data.venue.location.latitude ||
                !req.prostava.prostava_data.venue.location.longitude
            ) {
                res.sendStatus(406);
                return;
            }
        }
        if (!ProstavaUtils.canAnnounceProstava(req.prostava)) {
            res.sendStatus(406);
            return;
        }
        next();
    }
    static async canWithdrawProstava(req: Request, res: Response, next: NextFunction): Promise<void> {
        //TODO Send Message?
        if (!ProstavaUtils.canWithdrawProstava(req.prostava)) {
            res.sendStatus(406);
            return;
        }
        next();
    }

    static async saveProstava(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!ProstavaUtils.isProstavaModified(req.prostava)) {
            next();
        }
        try {
            await ProstavaUtils.saveProstava(req.prostava);
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async withdrawProstava(req: Request, res: Response, next: NextFunction): Promise<void> {
        ProstavaUtils.withdrawProstava(req.prostava);
        next();
    }
    static async announceProstava(req: Request, res: Response, next: NextFunction): Promise<void> {
        ProstavaUtils.announceProstava(req.prostava, req.group.settings);
        next();
    }
}
