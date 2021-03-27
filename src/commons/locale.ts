import { resolve } from "path";
import { I18n, pluralize } from "@edjopato/telegraf-i18n";
import { LANGUAGE } from "./constants";

//Load .yaml files from the locales folder
export const i18n = new I18n({
    directory: resolve(process.cwd(), "src/locales"),
    defaultLanguage: LANGUAGE.EN,
    allowMissing: false,
    useSession: true,
    sessionName: "session",
    templateData: {
        pluralize,
        uppercase: (value: string) => value.toUpperCase()
    }
});
