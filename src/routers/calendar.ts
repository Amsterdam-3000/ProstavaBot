import { Router } from "express";

import { ApiCalendarController } from "../controllers";

export const calendarRouter = Router();

calendarRouter.route("/:groupId.ics").get(ApiCalendarController.sendGroupCalendarOfProstavas);
calendarRouter.route("/apple/:groupId").get(ApiCalendarController.redirectToAppleCalendar);
calendarRouter.route("/google/:groupId").get(ApiCalendarController.redirectToGoogleCalendar);
