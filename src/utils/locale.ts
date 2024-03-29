import { I18nContext } from "@grammyjs/i18n";
import { Aztro, ProstavaStatus } from "../types";
import { ConstantUtils } from "./constant";
import { ConverterUtils } from "./converter";

export class LocaleUtils {
    static getErrorText(i18n: I18nContext, errorCode: string): string {
        const error = ConstantUtils.getErrorByCode(errorCode);
        const errorKey = `error.${error?.toLowerCase()}`;
        const variables = { code: errorCode };
        return i18n.t(errorKey, variables);
    }
    static getPollingText(i18n: I18nContext, pollingCode: string): string {
        const polling = ConstantUtils.getPollingByCode(pollingCode);
        const pollingKey = `polling.${polling?.toLowerCase()}`;
        const variables = { code: pollingCode };
        return i18n.t(pollingKey, variables);
    }

    static getCommandText(i18n: I18nContext, command: string, value?: string): string {
        const commandKey = `command.${command}`;
        const commandCode = ConstantUtils.getCommandCode(command);
        const variables = {
            code: commandCode,
            value: value || ""
        };
        return i18n.t(commandKey, variables);
    }
    static getCommandPlaceholder(i18n: I18nContext, command: string): string {
        return i18n.t(`command_text.${command}`);
    }

    static getActionText(i18n: I18nContext, action: string, value?: string): string {
        return this.getActionCommonText(i18n, "action", action, value);
    }
    static getActionReplyText(i18n: I18nContext, action: string, value?: string): string {
        return this.getActionCommonText(i18n, "reply", action, value);
    }
    private static getActionCommonText(i18n: I18nContext, group: string, action: string, value?: string): string {
        const actionName = ConverterUtils.sliceProstavaAction(action);
        const actionKey = `${group}.${actionName.replace(/-/g, ".")}`;
        const actionCode = ConstantUtils.getActionCode(actionName.replace(/-/g, "_"));
        const variables = {
            code: actionCode,
            value: value || ""
        };
        return i18n.t(actionKey, variables);
    }

    static getStatusText(i18n: I18nContext, status: ProstavaStatus, value?: string): string {
        const statusKey = `status.${status}`;
        const statusCode = ConstantUtils.getStatusCode(status);
        const variables = {
            code: statusCode,
            value: value || ""
        };
        return i18n.t(statusKey, variables);
    }

    static getLanguageText(i18n: I18nContext, language: string): string {
        return i18n.t(`language.${language}`);
    }
    static getCurrencyText(i18n: I18nContext, currency: string): string {
        return i18n.t(`currency.${currency}`);
    }

    static getAztroText(i18n: I18nContext, aztro: Aztro, key: string): string {
        const aztroKey = `aztro.${key}`;
        const variables = {
            value: aztro[key]
        };
        return i18n.t(aztroKey, variables);
    }
}
