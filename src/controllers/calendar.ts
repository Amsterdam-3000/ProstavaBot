import ical from "ical-generator";
import { Request, Response } from "express";
import { Prostava, User } from "../types";
import { ConverterUtils, GroupUtils, ProstavaUtils } from "../utils";

export class CalendarController {
    static async sendGroupCalendarOfProstavas(req: Request, res: Response) {
        try {
            const group = await GroupUtils.findGroupByChatIdFromDB(Number(req.params.groupId));
            if (!group) {
                throw new Error(`Not found groupId ${req.params.groupId}`);
            }
            GroupUtils.populateGroupProstavas(group);
            const calendar = ical(ConverterUtils.convertGroupToCalendar(group));
            (ProstavaUtils.filterScheduledProstavas(group.prostavas) as Prostava[]).forEach((prostava) => {
                const event = calendar.createEvent(ConverterUtils.convertProstavaToEvent(prostava));
                prostava.participants.forEach((participant) => {
                    event.createAttendee(ConverterUtils.convertParticipantToAttendee(participant));
                });
                (ProstavaUtils.filterUsersPendingToRateProstava(group.users, prostava) as User[]).forEach((user) => {
                    event.createAttendee(ConverterUtils.convertUserToAttendee(user));
                });
            });
            calendar.serve(res, `${req.params.groupId}.ics`);
        } catch (err) {
            console.log(err);
            res.sendStatus(404);
        }
    }

    static async redirectToAppleCalendar(req: Request, res: Response) {
        res.redirect(`webcal://${req.headers.host}/api/calendar/${req.params.groupId}.ics`);
    }

    static async redirectToGoogleCalendar(req: Request, res: Response) {
        res.redirect(
            `https://calendar.google.com/calendar/u/0/r/month?cid=http://${req.headers.host}/api/calendar/${req.params.groupId}.ics`
        );
    }
}
