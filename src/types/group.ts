import { Document, Model, Types } from "mongoose";
import { User } from "./user";

export interface GroupSettings {
    open_period?: number;
    min_percent?: number;
    prev_period?: number;
    language?: string;
}

export interface Group {
    _id: number;
    settings: GroupSettings;
    users: Array<User["_id"] | User>;
}

interface GroupBaseDocument extends Group, Document {
    _id: number;
}

export interface GroupDocument extends GroupBaseDocument {
    users: Array<User["_id"]>;
}

export interface GroupPopulatedDocument extends GroupBaseDocument {
    users: Array<User>;
}

export interface GroupModel extends Model<GroupDocument> {
    upsertGroup(groupId: Group["_id"]): Promise<GroupDocument>;
    updateSettings(groupId: Group["_id"], settings: GroupSettings): Promise<void>;
    pushUser(groupId: Group["_id"], userId: User["_id"]): Promise<void>;
    popUser(groupId: Group["_id"], userId: User["_id"]): Promise<void>;
}
