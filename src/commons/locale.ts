import { resolve } from "path";
import { I18n, pluralize } from "@edjopato/telegraf-i18n";
import { LOCALE } from "../constants";

//Load .yaml files from the locales folder
export const i18n = new I18n({
    directory: resolve(__dirname, "../", "locales"),
    defaultLanguage: LOCALE.LANGUAGE.EN,
    allowMissing: true,
    useSession: false,
    templateData: {
        pluralize,
        uppercase: (value: string) => value.toUpperCase()
    }
});