import { I18nContext } from "@grammyjs/i18n";
import { Express } from "express";

import { CODE, LOCALE } from "../constants";
import {
    ApiBaseObject,
    ApiGroup,
    ApiProstava,
    ApiUser,
    Group,
    GroupDocument,
    GroupSettings,
    PersonalData,
    Prostava,
    ProstavaType,
    User
} from "../types";
import { ConverterUtils } from "./converter";
import { LocaleUtils } from "./locale";
import { ConstantUtils } from "./constant";
import { GroupUtils, ProstavaUtils } from ".";

export class ApiUtils {
    //Group
    static convertGroupToApi(group: Group, chat: Express.Chat, isAdmin: boolean): ApiGroup {
        return {
            id: group._id.toString(),
            //TODO manual assign
            ...(group as GroupDocument).toObject({ virtuals: true }).settings,
            chat_members_all: chat.chat_member_count,
            prostava_types: group.settings.prostava_types.map((prostavaType) =>
                ApiUtils.convertProstavaTypeToObject(prostavaType)
            ),
            photo: group.group_photo,
            calendar_apple: group.calendar_apple,
            calendar_google: group.calendar_google,
            readonly: !isAdmin
        };
    }
    static convertGroupToObject(group: Group): ApiBaseObject {
        return {
            id: group._id.toString(),
            name: group.settings.name,
            photo: group.group_photo
        };
    }
    static convertApiToGroupSettings(group: ApiGroup): GroupSettings {
        return {
            name: group.name || "",
            emoji: group.emoji,
            language: group.language,
            currency: group.currency,
            timezone: group.timezone,
            chat_members_count: group.chat_members_count,
            create_days_ago: group.create_days_ago,
            participants_min_percent: group.participants_min_percent,
            pending_hours: group.pending_hours,
            prostava_types: group.prostava_types.map((prostavaType) =>
                ApiUtils.convertObjectToProstavaType(prostavaType)
            )
        };
    }

    //User
    static convertUserToApi(user: User, isAuthorized: boolean): ApiUser {
        return {
            id: user.user_id.toString(),
            name: user.personal_data.name || "",
            emoji: user.personal_data.emoji,
            birthday: user.personal_data.birthday || null,
            photo: user.user_photo,
            link: user.user_link,
            readonly: !isAuthorized
        };
    }
    static convertUserToObject(user: User): ApiBaseObject {
        return {
            id: user?.user_id?.toString(),
            name: user?.personal_data?.name,
            photo: user?.user_photo,
            link: user?.user_link
        };
    }
    static convertApiToUserPersonalData(user: ApiUser): PersonalData {
        return {
            name: user.name || "",
            emoji: user.emoji,
            birthday: user.birthday || undefined
        };
    }

    //Prostava
    static convertProstavaToApi(
        prostava: Prostava,
        isAuthorAuthorized: boolean,
        isCreatorAuthorized: boolean
    ): ApiProstava {
        return {
            id: prostava._id.toString(),
            name: prostava.prostava_data.title,
            emoji: prostava.prostava_data.type,
            photo: ConverterUtils.getEmojiImageUrl(prostava.prostava_data.type),
            author: this.convertUserToObject(prostava.author as User),
            creator: this.convertUserToObject(prostava.creator as User),
            creation_date: prostava.creation_date,
            closing_date: prostava.closing_date,
            status: prostava.status,
            date: prostava.prostava_data.date,
            timezone: prostava.prostava_data.timezone,
            is_preview: prostava.is_preview,
            is_request: prostava.is_request,
            rating: prostava.rating,
            participants_max_count: prostava.participants_max_count,
            participants_min_count: prostava.participants_min_count,
            venue: {
                id: prostava.prostava_data.venue?.foursquare_id || prostava.prostava_data.venue?.google_place_id || "",
                name: prostava.prostava_data.venue?.title,
                link: prostava.prostava_data.venue?.url,
                photo: prostava.prostava_data.venue?.photo,
                address: prostava.prostava_data.venue?.address,
                latitude: prostava.prostava_data.venue?.location?.latitude,
                longitude: prostava.prostava_data.venue?.location?.longitude
            },
            amount: prostava.prostava_data.cost?.amount,
            currency: prostava.prostava_data.cost?.currency,
            participants: prostava.participants.map((participant) => ({
                user: this.convertUserToObject(participant.user as User),
                rating: participant.rating
            })),
            readonly: !(
                ((isAuthorAuthorized && !prostava.is_request) || (isCreatorAuthorized && prostava.is_request)) &&
                ProstavaUtils.isProstavaNew(prostava)
            ),
            canWithdraw:
                ((isAuthorAuthorized && !prostava.is_request) || (isCreatorAuthorized && prostava.is_request)) &&
                ProstavaUtils.isProstavaPending(prostava),
            canRate: !isAuthorAuthorized && ProstavaUtils.isProstavaPending(prostava)
        };
    }

    //Global
    static convertProstavaTypeToObject(prostavaType: ProstavaType): ApiBaseObject {
        return {
            id: prostavaType.emoji,
            name: prostavaType.text,
            emoji: prostavaType.emoji,
            photo: ConverterUtils.getEmojiImageUrl(prostavaType.emoji),
            string: prostavaType.string,
            readonly: !GroupUtils.canDeleteProstavaType(prostavaType)
        };
    }
    static convertObjectToProstavaType(prostavaType: ApiBaseObject): ProstavaType {
        return {
            emoji: prostavaType.id,
            text: prostavaType.name
        };
    }
    static getLanguageObjects(i18n: I18nContext): ApiBaseObject[] {
        return Object.values(LOCALE.LANGUAGE).map((language) => ({
            id: language,
            name: LocaleUtils.getLanguageText(i18n, language),
            photo: ConverterUtils.getEmojiImageUrl(ConstantUtils.getLanguageCode(language))
        }));
    }
    static getCurrencyObjects(i18n: I18nContext): ApiBaseObject[] {
        return Object.entries(CODE.CURRENCY).map(([currencyKey, currencyCode]) => ({
            id: currencyCode,
            name: LocaleUtils.getCurrencyText(i18n, currencyKey.toLowerCase()),
            photo: ConverterUtils.getCurrencyImageUrl(currencyKey)
        }));
    }
}
