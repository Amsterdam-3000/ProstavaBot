import { CODE } from "../constants";
import { ProstavaStatus } from "../types";

export class ConstantUtils {
    static getLanguageCode(language: string) {
        return CODE.LANGUAGE[language.toUpperCase()];
    }
    static getActionCode(action: string) {
        return CODE.ACTION[action.toUpperCase()];
    }
    static getCommandCode(command: string) {
        return CODE.COMMAND[command.toUpperCase()];
    }
    static getStatusCode(status: ProstavaStatus) {
        return CODE.STATUS[status.toUpperCase()];
    }

    static getSelectedCode(selected: boolean) {
        return Object.values(CODE.SELECTED)[Number(selected)];
    }
    static getCheckedCode(checked: boolean) {
        return Object.values(CODE.CHECKED)[Number(checked)];
    }

    static getErrorByCode(errorCode: string) {
        return Object.keys(CODE.ERROR).find((key) => CODE.ERROR[key] === errorCode);
    }
    static getPollingByCode(pollingCode: string) {
        return Object.keys(CODE.POLLING).find((key) => CODE.POLLING[key] === pollingCode);
    }
}
