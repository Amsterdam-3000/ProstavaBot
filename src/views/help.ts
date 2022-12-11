import { I18nContext } from "@grammyjs/i18n";
import { renderFile } from "ejs";
import { resolve } from "path";
import { ConstantUtils, LocaleUtils } from "../utils";

export class HelpView {
    static getHelpHtml(i18n: I18nContext, isChatPrivate: boolean): Promise<string> {
        return renderFile(resolve(__dirname, "help.ejs"), {
            i18n: i18n,
            ConstantUtils: ConstantUtils,
            LocaleUtils: LocaleUtils,
            isChatPrivate: isChatPrivate
        });
    }
}
