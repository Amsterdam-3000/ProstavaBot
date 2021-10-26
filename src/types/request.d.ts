import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Group, User as GroupUser } from ".";

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
        }
        export interface Request {
            group: Group;
            groupUser: GroupUser;
            i18n: I18nContext;
        }
    }
}