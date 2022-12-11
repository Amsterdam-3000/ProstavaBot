import { resolve } from "path";
import { config } from "dotenv";

//Read .env file in the private folder and assign contents to process.env
config({ path: resolve(process.cwd(), "private", ".env") });

export const CONFIG = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    MONGODB_URL: process.env.MONGODB_URL,
    PROSTAVA_HOST: process.env.HOST,
    PROSTAVA_PORT: process.env.PORT,
    PROSTAVA_SCHEME: process.env.SCHEME || "https",
    PROSTAVAWEB_URL: process.env.PROSTAVAWEB_URL,
    SUPER_ADMIN_ID: Number(process.env.SUPER_ADMIN_ID),
    BOT_COMMANDS: {
        START: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Bot"
        },
        HELP: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Bot"
        },
        GROUP: {
            inPrivate: true,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Group"
        },
        SETTINGS: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Group"
        },
        PROFILE: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "User"
        },
        PROFILES: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "User"
        },
        PROFILES_ME: {
            inPrivate: false,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "User"
        },
        PROSTAVA: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: true,
            commandGroup: "Prostava"
        },
        PROSTAVA_UNDO: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        PROSTAVA_SAVE: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        PROSTAVA_RATE: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        PROSTAVAS_REJECT: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        REQUEST: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: true,
            commandGroup: "Prostava"
        },
        REQUEST_UNDO: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        REQUEST_SAVE: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        REQUEST_RATE: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        SEARCH: {
            inPrivate: false,
            inGroup: false,
            isGlobal: true,
            hasPlaceholder: false
        },
        REMINDERS: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        CALENDAR: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: false,
            commandGroup: "Prostava"
        },
        STATS: {
            inPrivate: true,
            inGroup: true,
            isGlobal: false,
            hasPlaceholder: true,
            commandGroup: "Stats"
        },
        STATS_TOTAL: {
            inPrivate: false,
            inGroup: false,
            isGlobal: false,
            hasPlaceholder: true,
            commandGroup: "Stats"
        }
    }
};
