import { PROSTAVA, CALENDAR } from "../constants";
import { CommonMiddleware, GroupMiddleware, ProstavaMiddleware } from "../middlewares";
import { CommonController, ProstavaController } from "../controllers";
import { RegexUtils } from "../utils";
import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { CommonScene } from "./common";

const Calendar = require("telegraf-calendar-telegram");

export const prostavaScene = new Scenes.BaseScene<UpdateContext>(PROSTAVA.COMMAND.PROSTAVA);
export const prostavaCalendar = new Calendar(prostavaScene, { startWeekDay: 1 });

prostavaScene.enter(
    ProstavaMiddleware.addPendingProstavaToContext,
    ProstavaMiddleware.addNewProstavaToContext,
    ProstavaMiddleware.saveProstava,
    GroupMiddleware.saveGroup,
    ProstavaController.showCreateOrRateProstava
);
prostavaScene.use(
    CommonMiddleware.isCbMessageOrigin,
    ProstavaMiddleware.addPendingProstavaToContext,
    ProstavaMiddleware.addNewProstavaToContext,
    ProstavaMiddleware.saveProstava
);

//Type
prostavaScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.PROSTAVA_TYPE), ProstavaController.showProstavaTypes);
prostavaScene.action(
    RegexUtils.matchSubAction(PROSTAVA.ACTION.PROSTAVA_TYPE),
    ProstavaMiddleware.changeProstavaType,
    ProstavaController.showProstavaTypes
);

//Title Venue
CommonScene.actionInputRequest(prostavaScene, PROSTAVA.ACTION.PROSTAVA_TITLE);
CommonScene.actionInputRequest(prostavaScene, PROSTAVA.ACTION.PROSTAVA_VENUE);
prostavaScene.hears(
    RegexUtils.matchTitle(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROSTAVA_TITLE, PROSTAVA.ACTION.PROSTAVA_VENUE]),
    ProstavaMiddleware.changeProstavaOrVenueTitle,
    CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
);
prostavaScene.on(
    "venue",
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROSTAVA_VENUE]),
    ProstavaMiddleware.changeProstavaVenue,
    CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
);
prostavaScene.on(
    "location",
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROSTAVA_VENUE]),
    ProstavaMiddleware.changeProstavaLocation,
    CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
);

//Date
prostavaScene.action(RegexUtils.matchAction(PROSTAVA.ACTION.PROSTAVA_DATE), ProstavaController.showProstavaCalendar);
prostavaScene.action(
    RegexUtils.matchCalendarAction(CALENDAR.ACTION.CALENDAR_DATE),
    ProstavaMiddleware.changeProstavaDate
);
prostavaCalendar.setDateListener(ProstavaController.backToCreateProstava);

//Cost
CommonScene.actionInputRequest(prostavaScene, PROSTAVA.ACTION.PROSTAVA_COST);
prostavaScene.hears(
    RegexUtils.matchCost(),
    CommonMiddleware.checkStateAction([PROSTAVA.ACTION.PROSTAVA_COST]),
    ProstavaMiddleware.changeProstavaCost,
    CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
);

//Create prostava
prostavaScene.action(
    RegexUtils.matchAction(PROSTAVA.ACTION.PROSTAVA_CREATE),
    ProstavaMiddleware.isProstavaDataFull,
    ProstavaMiddleware.announceProstava,
    CommonController.enterScene(PROSTAVA.COMMAND.PROSTAVA)
);

//Back
CommonScene.actionBack(prostavaScene, ProstavaController.backToCreateProstava);
//Exit
CommonScene.actionExit(prostavaScene);
//Hide
prostavaScene.leave(CommonController.hideScene);
