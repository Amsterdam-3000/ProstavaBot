//Telegram Values
export const CHAT_TYPE = {
    GROUP: "group",
    PRIVATE: "private"
};
export const MEMBER_STATUS = {
    OWNER: "creator",
    ADMIN: "administrator",
    MEMBER: "member"
};

//Mongo Values
export const DB_COLLECTION = {
    GROUP: "Group",
    USER: "User"
};

//BOT Values
export const COMMAND = {
    START: "start",
    HELP: "help",
    SETTINGS: "settings",
    PROFILE: "profile",
    PROSTAVA: "prostava",
    SEARCH: "search"
};
export const SCENE = {
    START: "start",
    HELP: "help",
    SETTINGS: "settings",
    PROFILE: "profile",
    PROSTAVA: "prostava",
    SEARCH: "search",
    EMOJI: "emoji",
    BIRTHDAY: "birthday"
};
export const ACTION = {
    SHOW_LANGUAGES: "show_languages",
    CHANGE_LANGUAGE: "change_language",
    SET_EMOJI: "set_emoji",
    SET_BIRTHDAY: "set_birthday",
    BACK: "back"
};
export const LANGUAGE_CODE = {
    RU: "ru",
    EN: "en"
};
export const LANGUAGE_CODE_TEXT = {
    RU: "🇷🇺",
    EN: "🇺🇸"
};
export const CHECKBOX_CODE = {
    SELECTED: "✔️",
    NOT_SELECTED: "➖"
};
export const ERROR_CODE = {
    NOT_GROUP: "🚫",
    NOT_ADMIN: "🔞",
    APP_WRONG: "📵",
    ARE_GOING: "🚳"
};
export const DEFAULT_CODE = {
    EMOJI: "🤡",
    BIRTHDAY: "🎂",
    BACK: "🔙"
};
export const COMMAND_CODE = {
    START: "🎬",
    HELP: "🚑",
    SETTINGS: "🛠",
    PROFILE: "👤",
    PROSTAVA: "🍺",
    SEARCH: "🔎",
    LANGUAGE: "👅"
};

//Locale value
export const LOCALE_COMMAND = {
    START: "command.start",
    HELP: "command.help",
    SETTINGS: "command.settings",
    PROFILE: "command.profile",
    PROSTAVA: "command.prostava",
    SEARCH: "command.search",
    LANGUAGE: "command.language"
};
export const LOCALE_COMMAND_GROUP = {
    BOT: "command_group.bot",
    USER: "command_group.user",
    PROSTAVA: "command_group.prostava"
};
export const LOCALE_HEADER = {
    HELP: "header.help"
};
export const LOCALE_REPLY = {
    NOT_GROUP: "reply.not_group",
    NOT_ADMIN: "reply.not_admin",
    APP_WRONG: "reply.app_wrong",
    SEND_EMOJI: "reply.send_emoji",
    SEND_BIRTHDAY: "reply.send_birthday",
    ARE_GOING: "reply.are_going"
};
export const LOCALE_ACTION = {
    SHOW_LANGUAGES: "action.show_languages",
    SET_EMOJI: "action.set_emoji",
    SET_BIRTHDAY: "action.set_birthday",
    BACK: "action.back"
};
