import { PROSTAVA } from "../constants";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ConverterUtils } from "../utils";

const CalendarHelper = require("telegraf-calendar-telegram/calendar-helper");
const Calendar = require("telegraf-calendar-telegram");

class ProstavaCalendarHelper extends CalendarHelper {
    constructor(options) {
        super(options);
    }

    getPage(m, inputDate) {
        const page = super.getPage(m, inputDate);
        this.addFooter(page, m);
        return page;
    }
    addDays(page, m, date) {
        super.addDays(page, m, date);
        if (!this.options.dateTexts) {
            return;
        }
        page.slice(2, -1).forEach((row) =>
            row.forEach((dayButton) => {
                const day = ConverterUtils.sliceCalendarActionDate(dayButton.callback_data);
                if (this.options.dateTexts.has(day)) {
                    dayButton.text = this.options.dateTexts.get(day);
                }
            })
        );
    }
    addFooter(page, m) {
        const footer: InlineKeyboardButton[] = [];
        footer.push(m.callbackButton(this.options.exitName, PROSTAVA.ACTION.EXIT));
        page.push(footer);
    }

    setDateTexts(texts) {
        this.options.dateTexts = texts;
    }
    setExitName(name) {
        this.options.exitName = name;
    }
}

class ProstavaCalendar extends Calendar {
    constructor(options) {
        super(undefined, options);
        this.helper = new ProstavaCalendarHelper(options);
    }

    setBot(bot) {
        this.bot = bot;
    }
    setDateTexts(texts) {
        this.helper.setDateTexts(texts);
        return this;
    }
    setExitName(name) {
        this.helper.setExitName(name);
        return this;
    }
}

export const prostavaCalendar = new ProstavaCalendar({ startWeekDay: 1 });
