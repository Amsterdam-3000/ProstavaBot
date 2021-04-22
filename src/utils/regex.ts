import { CALENDAR, PROSTAVA } from "../constants";
import { StringUtils } from "./string";

export class RegexUtils {
    static matchDate() {
        //TODO Match year month day
        return /^\d{4}-\d{2}-\d{2}$/;
    }
    static matchTitle() {
        return /^\p{L}.*$/u;
    }
    static matchCost() {
        //TODO Match max
        return /^\d+(\.\d\d?)?(\p{Sc})?$/u;
    }
    static matchNumber() {
        return /^\d+$/;
    }

    static matchProstavaActionPrefix() {
        return /^prostava-/;
    }
    static matchAction(action: string) {
        return new RegExp(`${action}([^-]|$)`);
    }
    static matchSubAction(action: string) {
        return new RegExp(`${StringUtils.getSubAction(action)}`);
    }
    static matchCalendarActions() {
        return new RegExp(
            Object.values(CALENDAR.ACTION).reduce((regex, action) => (regex ? regex + "|" + action : action), "")
        );
    }
    static matchCommand() {
        return /^\/[^\s]+/;
    }

    static matchCommands() {
        return new RegExp(
            Object.values(PROSTAVA.COMMAND).reduce(
                (regex, command) => (regex ? regex + "|" + "/" + command : "/" + command),
                ""
            )
        );
    }

    static matchEmojis() {
        //TODO Delete \\u{1F6CD} after emoji-regex update
        return new RegExp(`^(${require("emoji-regex/es2015/RGI_Emoji")().source}|\\u{1F6CD})$`, "u");
    }
}
