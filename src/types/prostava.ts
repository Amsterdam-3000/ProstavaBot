import { Document, Model, Types } from "mongoose";
import { Venue } from "telegraf/typings/core/types/typegram";
import { Group } from "./group";
import { User } from "./user";

export enum ProstavaStatus {
    New = "new",
    Pending = "pending",
    Approved = "approved",
    Rejected = "rejected"
}

export type ProstavaRating = -1 | 0 | 1 | 2 | 3 | 4 | 5;

export interface ProstavaCost {
    amount?: number;
    currency?: string;
    string?: string;
}
export interface ProstavaVenue extends Venue {
    string?: string;
}
export interface ProstavaData {
    title?: string;
    date?: Date;
    venue?: ProstavaVenue;
    cost?: ProstavaCost;
}

export interface ProstavaParticipant {
    user: User["_id"] | User;
    rating?: number;
}

export interface Prostava {
    _id?: Types.ObjectId;
    group_id: Group["_id"];
    author: User["_id"] | User;
    status: ProstavaStatus;
    rating: number;
    rating_string?: string;
    prostava_data?: ProstavaData;
    participants?: [ProstavaParticipant];
    participants_string?: string;
    participants_min_count?: number;
    chat_members_count?: number;
}

export interface ProstavaDocument extends Prostava, Document {
    _id: Types.ObjectId;
}

export interface ProstavaModel extends Model<ProstavaDocument> {}
