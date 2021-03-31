import { renderFile } from "ejs";
import { resolve } from "path";
import { COMMAND, LOCALE_COMMAND, LOCALE_HEADER, LOCALE_COMMAND_GROUP } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const addHelpToContext = async (ctx: UpdateContext, next: Function) => {
    if (!ctx.help) {
        //TODO Catch error
        ctx.help = await renderFile(resolve(process.cwd(), "src/views", "help.ejs"), {
            i18n: ctx.i18n,
            COMMAND: COMMAND,
            LOCALE_COMMAND: LOCALE_COMMAND,
            LOCALE_HEADER: LOCALE_HEADER,
            LOCALE_COMMAND_GROUP: LOCALE_COMMAND_GROUP
        });
    }
    return next();
};
