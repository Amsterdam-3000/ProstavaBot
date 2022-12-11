import { I18nContext } from "@grammyjs/i18n";
import { BotCommand } from "telegraf/typings/core/types/typegram";

import { CONFIG } from "../commons/config";
import { CODE, PROSTAVA } from "../constants";
import { ProstavaStatus } from "../types";
import { LocaleUtils } from "./locale";

export class ConstantUtils {
    static getLanguageCode(language: string): string {
        return CODE.LANGUAGE[language.toUpperCase()];
    }
    static getActionCode(action: string): string {
        return CODE.ACTION[action.toUpperCase()];
    }
    static getCommandCode(command: string): string {
        return CODE.COMMAND[command.toUpperCase()];
    }
    static getStatusCode(status: ProstavaStatus): string {
        return CODE.STATUS[status.toUpperCase()];
    }

    static getSelectedCode(selected: boolean): string {
        return Object.values(CODE.SELECTED)[Number(selected)];
    }
    static getCheckedCode(checked: boolean): string {
        return Object.values(CODE.CHECKED)[Number(checked)];
    }

    static getErrorByCode(errorCode: string): string | undefined {
        return Object.keys(CODE.ERROR).find((key) => CODE.ERROR[key] === errorCode);
    }
    static getPollingByCode(pollingCode: string): string | undefined {
        return Object.keys(CODE.POLLING).find((key) => CODE.POLLING[key] === pollingCode);
    }

    static getCommandConfig(command: string): Record<string, string> {
        return CONFIG.BOT_COMMANDS[command.toUpperCase()];
    }

    private static getCommandsForPrivateChat(): string[] {
        return Object.values(PROSTAVA.COMMAND).filter((command) => this.getCommandConfig(command).inPrivate);
    }
    private static getCommandsForGroupChat(): string[] {
        return Object.values(PROSTAVA.COMMAND).filter((command) => this.getCommandConfig(command).inGroup);
    }
    private static filterCommandsByGroup(commands: string[], commandGroup: string): string[] {
        return commands.filter((command) => this.getCommandConfig(command).commandGroup === commandGroup);
    }
    private static getCommandWithPlaceHolder(i18n: I18nContext, command: string): string {
        return this.getCommandConfig(command).hasPlaceholder
            ? `${command} ${LocaleUtils.getCommandPlaceholder(i18n, command)}`
            : command;
    }
    static getBotCommands(i18n: I18nContext, forPrivateChat = false): BotCommand[] {
        return (forPrivateChat ? this.getCommandsForPrivateChat() : this.getCommandsForGroupChat()).map((command) => ({
            command: command,
            description: LocaleUtils.getCommandText(i18n, command)
        }));
    }
    static getBotCommandsForHelp(i18n: I18nContext, commandGroup: string, forPrivateChat = false): BotCommand[] {
        return this.filterCommandsByGroup(
            forPrivateChat ? this.getCommandsForPrivateChat() : this.getCommandsForGroupChat(),
            commandGroup
        ).map((command) => ({
            command: this.getCommandWithPlaceHolder(i18n, command),
            description: LocaleUtils.getCommandText(i18n, command)
        }));
    }
}
