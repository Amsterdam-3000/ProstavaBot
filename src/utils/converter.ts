import { ICalAttendeeData, ICalAttendeeStatus, ICalCalendarData, ICalEventData, ICalEventStatus } from "ical-generator";
import { Group, Prostava, ProstavaParticipant, ProstavaStatus, User } from "../types";
import { CALENDAR, CODE, PROSTAVA } from "../constants";
import { CONFIG } from "../commons/config";
import { ConstantUtils } from "./constant";
import { RegexUtils } from "./regex";
import moment from "moment";

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
    static convertGroupToCalendar(group: Group): ICalCalendarData {
        return {
            prodId: `//${CONFIG.PROSTAVA_HOST}//${group._id}//EN`,
            name: group.settings.name
        };
    }
    static convertProstavaToEvent(prostava: Prostava): ICalEventData {
        return {
            start: moment(prostava.prostava_data.date),
            //TODO Default duration
            end: moment(prostava.prostava_data.date).add(4, "hours"),
            summary: prostava.title,
            status: this.convertProstavaStatusToEvent(prostava.status),
            location: prostava.prostava_data.venue.title
                ? {
                      title: prostava.prostava_data.venue.title,
                      address: prostava.prostava_data.venue.address,
                      geo: prostava.prostava_data.venue.location
                          ? {
                                lat: prostava.prostava_data.venue.location.latitude,
                                lon: prostava.prostava_data.venue.location.longitude
                            }
                          : undefined,
                      radius: 1
                  }
                : null,
            //TODO Rating and Cost
            //description: "",
            organizer: {
                name: (prostava.author as User).user_string || (prostava.author as User).personal_data.name,
                email: (prostava.author as User).user_id.toString()
            }
        };
    }
    static convertParticipantToAttendee(participant: ProstavaParticipant): ICalAttendeeData {
        return {
            name: (participant.user as User).user_string || (participant.user as User).personal_data.name,
            email: (participant.user as User).user_id.toString(),
            status: ConverterUtils.convertParticipantRatingToAttendee(participant.rating)
        };
    }
    static convertUserToAttendee(user: User): ICalAttendeeData {
        return {
            name: user.user_string || user.personal_data.name,
            email: user.user_id.toString(),
            status: ICalAttendeeStatus.TENTATIVE
        };
    }
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
