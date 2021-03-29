import { Document, Model } from "mongoose";

//Group
export interface GroupSettings {
    open_period?: number;
    min_percent?: number;
    prev_period?: number;
}
export interface Group {
    _id: number;
    settings: GroupSettings;
}
export interface GroupDocument extends Group, Document {
    _id: number;
}
export interface GroupModel extends Model<GroupDocument> {}
