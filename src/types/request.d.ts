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
        }
    }
}
