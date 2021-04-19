import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { renderFile } from "ejs";
import { resolve } from "path";
import { PROSTAVA } from "../constants";
import { LocaleUtils } from "../utils";

export class HelpView {
    static getHelpHtml(i18n: I18nContext) {
        return renderFile(resolve(__dirname, "help.ejs"), {
            i18n: i18n,
            COMMAND: PROSTAVA.COMMAND,
            LocaleUtils: LocaleUtils
        });
    }
}
