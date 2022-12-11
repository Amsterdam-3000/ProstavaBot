import { I18nContext } from "@grammyjs/i18n";
import { getVtimezoneComponent } from "@touch4it/ical-timezones";
import { ICalAttendeeData, ICalAttendeeStatus, ICalCalendarData, ICalEventData } from "ical-generator";
import { DateTime } from "luxon";
import { User, Group, Prostava, ProstavaParticipant, ProstavaStatus } from "../types";
import { CONFIG } from "../commons/config";
import { ConverterUtils, LocaleUtils, ProstavaUtils } from "../utils";
import { PROSTAVA } from "../constants";

export class CalendarView {
    static getGroupCalendar(group: Group): ICalCalendarData {
        return {
            prodId: `//${CONFIG.PROSTAVA_HOST}//${group._id}//${group.settings.language.toUpperCase()}`,
            name: group.settings.name,
            timezone: {
                name: group.settings.timezone,
                generator: getVtimezoneComponent
            }
        };
    }

    static getProstavaEvent(prostava: Prostava, i18n: I18nContext): ICalEventData {
        const dateTime = DateTime.fromJSDate(prostava.prostava_data.date).setZone(prostava.prostava_data.timezone);
        return {
            start: dateTime,
            //TODO Default duration
            end: dateTime.plus({ hours: 4 }),
            timezone: prostava.prostava_data.timezone,
            summary: prostava.title,
            status: ConverterUtils.convertProstavaStatusToEvent(prostava.status),
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
            description:
                prostava.status === ProstavaStatus.Approved
                    ? LocaleUtils.getActionText(
                          i18n,
                          PROSTAVA.ACTION.PROSTAVA_COST,
                          prostava.prostava_data.cost?.string
                      ) +
                      "\n" +
                      LocaleUtils.getActionText(
                          i18n,
                          PROSTAVA.ACTION.PROSTAVA_RATING,
                          ProstavaUtils.getProstavaRatingString(prostava.rating, prostava.rating_string)
                      )
                    : "",
            organizer: {
                name: (prostava.author as User).user_string || (prostava.author as User).personal_data.name,
                email: (prostava.author as User).user_id.toString()
            }
        };
    }

    static getParticipantAttendee(participant: ProstavaParticipant): ICalAttendeeData {
        return {
            name: (participant.user as User).user_string || (participant.user as User).personal_data.name,
            email: (participant.user as User).user_id.toString(),
            status: ConverterUtils.convertParticipantRatingToAttendee(participant.rating)
        };
    }
    static getUserAttendee(user: User): ICalAttendeeData {
        return {
            name: user.user_string || user.personal_data.name,
            email: user.user_id.toString(),
            status: ICalAttendeeStatus.TENTATIVE
        };
    }
}
