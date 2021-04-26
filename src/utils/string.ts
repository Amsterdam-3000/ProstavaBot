import { CALENDAR, CODE, PROSTAVA } from "../constants";
import { ConstantUtils } from "./constant";
import { RegexUtils } from "./regex";

export class StringUtils {
    static displaySelectedValue(value: string, selected: boolean) {
        return `${value} ${ConstantUtils.getSelectedCode(selected)}`;
    }
    static displayValue(value: string | undefined, code = CODE.SELECTED.NOT_SELECTED) {
        if (value) {
            return value;
        }
        return code;
    }

    static getSubAction(action: string) {
        return `${action}-`;
    }
    static sliceProstavaAction(action: string) {
        return action.replace(RegexUtils.matchProstavaActionPrefix(), "");
    }
    static sliceCalendarActionDate(action: string) {
        return action.replace(CALENDAR.ACTION.CALENDAR_DATE, "");
    }

    static concatSessionKey(fromId?: number, chatId?: number) {
        //TODO Need local redis for dev
        let sessionKey = `${process.env.NODE_ENV}:${PROSTAVA.COLLECTION.SESSION}`;
        if (fromId) {
            sessionKey = `${sessionKey}:${fromId}`;
        }
        if (chatId) {
            sessionKey = `${sessionKey}:${chatId}`;
        }
        return sessionKey;
    }
}
