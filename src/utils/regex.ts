import { ConverterUtils } from "./converter";

export class RegexUtils {
    static matchDate(): RegExp {
        //TODO Match year month day
        return /^\d{4}-\d{2}-\d{2}$/;
    }
    static matchTime(): RegExp {
        return /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    }
    static matchTitle(): RegExp {
        return /^\p{L}.*$/u;
    }
    static matchCost(): RegExp {
        //TODO Match max
        return /^\d+(\.\d\d?)?(\p{Sc})?$/u;
    }
    static matchNumber(): RegExp {
        return /^\d+$/;
    }
    static matchYear(): RegExp {
        return /^\d\d\d\d$/;
    }

    static matchProstavaActionPrefix(): RegExp {
        return /^prostava-/;
    }
    static matchAction(action: string): RegExp {
        return new RegExp(`(^|[\|])${action}([\|]|$)`);
    }
    static matchSubAction(action: string): RegExp {
        return new RegExp(`(^|[\|])${ConverterUtils.getSubAction(action)}[\|]`);
    }
    static matchCalendarAction(action: string): RegExp {
        return new RegExp(`${action}[\\d-]+`);
    }
    static matchCommand(command?: string): RegExp {
        return command ? new RegExp(`^/${command}(\\s|$)`) : /^\/[^\s]+/;
    }
    static matchUser(): RegExp {
        return /@[^\s]+/;
    }

    static matchEmoji(): RegExp {
        return new RegExp(require("emoji-regex")().source);
    }

    static matchOneEmoji(): RegExp {
        return new RegExp(`^(${require("emoji-regex")().source})$`, "g");
    }

    static matchOneEmojiAndText(): RegExp {
        return new RegExp(`^(${require("emoji-regex")().source})\\s.*$`, "g");
    }
}
