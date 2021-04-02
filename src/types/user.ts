import { Document, Model, Types } from "mongoose";

export interface PersonalData {
    emoji?: string;
    birthday?: Date;
}

export interface User {
    _id: Types.ObjectId;
    user_id: number;
    group_id: number;
    personal_data: PersonalData;
}

export interface UserDocument extends User, Document {
    _id: Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {
    upsertUser(userId: User["user_id"], groupId: User["group_id"]): Promise<UserDocument>;
    updatePersonalData(userId: User["user_id"], groupId: User["group_id"], personal_data: PersonalData): Promise<void>;
}
