import { PROSTAVA, CALENDAR } from "../constants";
import { CommonMiddleware, ProstavaMiddleware } from "../middlewares";
import { CommonController, ProstavaController } from "../controllers";
import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { CommonScene } from "./common";
import { prostavaCalendar } from "../commons/calendar";
import { RegexUtils } from "../utils";

export const calendarScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.SCENE.CALENDAR);

calendarScene.enter(ProstavaMiddleware.addDateProstavasToContext, ProstavaController.showCalendarOfProstavas);
calendarScene.use(CommonMiddleware.isCbMessageOrigin);

calendarScene.action(
    RegexUtils.matchCalendarAction(CALENDAR.ACTION.CALENDAR_DATE),
    ProstavaMiddleware.addDateProstavasToContext
);
prostavaCalendar.setBot(calendarScene);
prostavaCalendar.setDateListener(ProstavaController.refreshCalendarOfProstavas);

//Exit
CommonScene.actionExit(calendarScene);
//Hide
calendarScene.leave(CommonController.hideScene);
