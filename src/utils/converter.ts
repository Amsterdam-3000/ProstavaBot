import { ICalAttendeeStatus, ICalEventStatus } from "ical-generator";
import { ProstavaStatus } from "../types";
import { CALENDAR, CODE, PROSTAVA } from "../constants";
import { ConstantUtils } from "./constant";
import { RegexUtils } from "./regex";
import emojiToolkit from "emoji-toolkit";
import emojiUnicode from "emoji-unicode";

export class ConverterUtils {
    //Value
    static displaySelectedValue(value: string, selected: boolean): string {
        return `${value} ${ConstantUtils.getSelectedCode(selected)}`;
    }
    static displayValue(value: string | undefined, code = CODE.SELECTED.NOT_SELECTED): string {
        if (value) {
            return value;
        }
        return code;
    }

    //Action
    static getSubAction(action: string): string {
        return `${action}-`;
    }
    static sliceProstavaAction(action: string): string {
        return action.replace(RegexUtils.matchProstavaActionPrefix(), "");
    }
    static sliceCalendarActionDate(action: string): string {
        return action.replace(CALENDAR.ACTION.CALENDAR_DATE, "");
    }
    static stringifyActionData(action: string, value?: string, id?: string, isPublic = false): string {
        return action + "|" + (value || 0) + "|" + (id || 0) + "|" + (isPublic ? 1 : 0);
    }
    //TODO Create type action data
    static parseActionData(data: string | undefined) {
        if (!data) {
            return undefined;
        }
        const actionData = data.split("|");
        return {
            action: actionData[0],
            value: actionData[1],
            id: actionData[2],
            isPublic: Boolean(Number(actionData[3]))
        };
    }

    //Calendar
    static convertProstavaStatusToEvent(prostavaStatus: ProstavaStatus): ICalEventStatus {
        let eventStatus: ICalEventStatus;
        switch (prostavaStatus) {
            case ProstavaStatus.Approved:
                eventStatus = ICalEventStatus.CONFIRMED;
                break;
            case ProstavaStatus.Rejected:
                eventStatus = ICalEventStatus.CANCELLED;
                break;
            default:
                eventStatus = ICalEventStatus.TENTATIVE;
                break;
        }
        return eventStatus;
    }
    static convertParticipantRatingToAttendee(participantRating: number): ICalAttendeeStatus {
        return participantRating > 0 ? ICalAttendeeStatus.ACCEPTED : ICalAttendeeStatus.DECLINED;
    }

    //Session
    static concatSessionKey(fromId?: number, chatId?: number): string {
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

    //Emoji Url
    static getEmojiImageUrl(emoji: string | undefined): string | undefined {
        const emojiImageUrl = emojiToolkit.toImage(emoji)?.match(/(?<=src=")[^"]+/);
        if (emojiImageUrl?.length) {
            return emojiImageUrl[0]?.replace("/32/", "/128/");
        }
        const emojiCode = emojiUnicode(emoji);
        if (emojiCode && !emojiCode.includes(" ")) {
            return `https://cdn.jsdelivr.net/joypixels/assets/6.5/png/unicode/128/${emojiCode}.png`;
        }
        return;
    }
    //Currency Url
    static getCurrencyImageUrl(currency: string): string {
        let currencyImageUrl: string;
        switch (currency) {
            case "RUBLE":
                currencyImageUrl = "https://img.icons8.com/color/48/000000/ruble--v1.png";
                break;
            case "EURO":
                currencyImageUrl = "https://img.icons8.com/color/48/000000/euro-pound-exchange--v1.png";
                break;
            case "DOLLAR":
                currencyImageUrl = "https://img.icons8.com/color/48/000000/us-dollar--v1.png";
                break;
            case "SHEQEL":
                currencyImageUrl = "https://img.icons8.com/color/48/000000/shekel--v1.png";
                break;
            default:
                currencyImageUrl = "https://img.icons8.com/color/48/000000/currency.png";
                break;
        }
        return currencyImageUrl;
    }
}
