import { Document, Model, Types } from "mongoose";

export interface PersonalData {
    name: string;
    emoji?: string;
    birthday?: Date;
}

export interface User {
    _id: Types.ObjectId;
    user_id: number;
    group_id: number;
    personal_data: PersonalData;
    user_link?: string;
    user_photo?: string;
    user_string?: string;
}

export interface UserDocument extends User, Document {
    _id: Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {}
