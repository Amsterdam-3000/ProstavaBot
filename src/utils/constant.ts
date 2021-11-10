import { CODE } from "../constants";
import { ProstavaStatus } from "../types";

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
}
