import { ICalAttendeeStatus, ICalEventStatus } from "ical-generator";
import { ProstavaStatus } from "../types";
import { CALENDAR, CODE, PROSTAVA } from "../constants";
import { ConstantUtils } from "./constant";
import { RegexUtils } from "./regex";

export class ConverterUtils {
    //Value
    static displaySelectedValue(value: string, selected: boolean) {
        return `${value} ${ConstantUtils.getSelectedCode(selected)}`;
    }
    static displayValue(value: string | undefined, code = CODE.SELECTED.NOT_SELECTED) {
        if (value) {
            return value;
        }
        return code;
    }

    //Action
    static getSubAction(action: string) {
        return `${action}-`;
    }
    static sliceProstavaAction(action: string) {
        return action.replace(RegexUtils.matchProstavaActionPrefix(), "");
    }
    static sliceCalendarActionDate(action: string) {
        return action.replace(CALENDAR.ACTION.CALENDAR_DATE, "");
    }
    static stringifyActionData(action: string, value?: string, id?: string, isPublic = false): string {
        return action + "|" + (value || 0) + "|" + (id || 0) + "|" + (isPublic ? 1 : 0);
    }
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
    static convertProstavaStatusToEvent(prostavaStatus: ProstavaStatus) {
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
    static convertParticipantRatingToAttendee(participantRating: number) {
        return participantRating > 0 ? ICalAttendeeStatus.ACCEPTED : ICalAttendeeStatus.DECLINED;
    }

    //Session
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
