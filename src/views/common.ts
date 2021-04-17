import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { PROSTAVA } from "../constants";
import { LocaleUtils } from "../utils";

export class CommonView {
    static getBackButton(i18n: I18nContext) {
        return Markup.button.callback(LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.BACK), PROSTAVA.ACTION.BACK);
    }
}
