import { I18nContext } from "@grammyjs/i18n";
import { Group, Prostava, User as GroupUser } from ".";

declare global {
    namespace Express {
        export interface User {
            id: number;
            first_name: string;
            last_name?: string | undefined;
            username?: string | undefined;
            photo_url?: string | undefined;
            iat: number;
            exp: number;
            is_admin?: boolean;
            is_creator?: boolean;
            is_author?: boolean;
        }
        export interface Chat {
            chat_member_count: number
        }
        export interface Request {
            chat: Chat;
            group: Group;
            groupUser: GroupUser;
            prostava: Prostava;
            i18n: I18nContext;
        }
    }
}