import { ConverterUtils } from "./converter";

export class RegexUtils {
    static matchDate() {
        //TODO Match year month day
        return /^\d{4}-\d{2}-\d{2}$/;
    }
    static matchTime() {
        return /^(?:[01]\d|2[0-3]):[0-5]\d$/;
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
        return new RegExp(`(^|[\|])${action}([\|]|$)`);
    }
    static matchSubAction(action: string) {
        return new RegExp(`(^|[\|])${ConverterUtils.getSubAction(action)}[\|]`);
    }
    static matchCalendarAction(action: string) {
        return new RegExp(`${action}[\\d-]+`);
    }
    static matchCommand(command?: string) {
        return command ? new RegExp(`^/${command}(\\s|$)`) : /^\/[^\s]+/;
    }
    static matchUser() {
        return /@[^\s]+/;
    }

    static matchOneEmoji() {
        //TODO Delete \\u{1F6CD} after emoji-regex update
        return new RegExp(`^(${require("emoji-regex/es2015")().source}|\\u{1F6CD})$`, "u");
    }
}
