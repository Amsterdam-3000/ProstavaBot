import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Express } from "express";

import { CODE, LOCALE } from "../constants";
import {
    ApiBaseObject,
    ApiGroup,
    ApiUser,
    Group,
    GroupDocument,
    GroupSettings,
    PersonalData,
    ProstavaType,
    User
} from "../types";
import { ConverterUtils } from "./converter";
import { LocaleUtils } from "./locale";
import { ConstantUtils } from "./constant";
import { GroupUtils } from ".";

export class ApiUtils {
    static convertGroupToApi(group: Group, chat: Express.Chat, readOnly = true): ApiGroup {
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
            readonly: readOnly
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

    static convertUserToApi(user: User, readOnly: boolean): ApiUser {
        return {
            id: user.user_id.toString(),
            name: user.personal_data.name || "",
            emoji: user.personal_data.emoji,
            birthday: user.personal_data.birthday || null,
            photo: user.user_photo,
            link: user.user_link,
            readonly: readOnly
        };
    }
    static convertUserToObject(user: User): ApiBaseObject {
        return {
            id: user._id.toString(),
            name: user.personal_data.name,
            photo: user.user_photo,
            link: user.user_link
        };
    }
    static convertApiToUserPersonalData(user: ApiUser): PersonalData {
        return {
            name: user.name || "",
            emoji: user.emoji,
            birthday: user.birthday || undefined
        };
    }

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
