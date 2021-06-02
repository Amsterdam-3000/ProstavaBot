import { Document, Model } from "mongoose";
import { Prostava, ProstavaType } from "./prostava";
import { User } from "./user";

export interface GroupSettings {
    name: string;
    language: string;
    currency: string;
    timezone: string;
    prostava_types: ProstavaType[];
    create_days_ago: number;
    chat_members_count: number;
    participants_min_percent: number;
    pending_hours: number;
}

export interface Group {
    _id: number;
    settings: GroupSettings;
    users: (User["_id"] | User)[];
    prostavas: (Prostava["_id"] | Prostava)[];
    group_photo?: string;
    calendar_google?: string;
    calendar_apple?: string;
}

interface GroupBaseDocument extends Group, Document {
    _id: number;
}

export interface GroupDocument extends GroupBaseDocument {
    users: User["_id"][];
    prostavas: Prostava["_id"][];
}

export interface GroupPopulatedDocument extends GroupBaseDocument {
    users: User[];
    prostavas: Prostava[];
}

export interface GroupModel extends Model<GroupDocument> {}
