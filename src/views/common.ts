import { I18nContext } from "@grammyjs/i18n";
import { Markup } from "telegraf";

import { PROSTAVA } from "../constants";
import { LocaleUtils } from "../utils";

export class CommonView {
    static getBackButton(
        i18n: I18nContext,
        hide = false,
        text = LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.BACK)
    ) {
        return Markup.button.callback(text, PROSTAVA.ACTION.BACK, hide);
    }
    static getExitButton(i18n: I18nContext, hide = false) {
        return Markup.button.callback(
            LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.EXIT),
            PROSTAVA.ACTION.EXIT,
            hide
        );
    }
}
