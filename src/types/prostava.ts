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

export interface ProstavaType {
    text?: string;
    emoji: string;
    string?: string;
}

export interface ProstavaCost {
    amount?: number;
    currency?: string;
    string?: string;
}
export interface ProstavaVenue extends Venue {
    url?: string;
    photo?: string;
    thumb?: string;
}
export interface ProstavaData {
    type: string;
    title?: string;
    date: Date;
    timezone: string;
    venue: ProstavaVenue;
    cost?: ProstavaCost;
}

export interface ProstavaParticipant {
    user: User["_id"] | User;
    rating: number;
}

export interface Prostava {
    _id: Types.ObjectId;
    group_id: Group["_id"];
    author: User["_id"] | User;
    status: ProstavaStatus;
    creator: User["_id"] | User;
    is_request: boolean;
    is_preview: boolean;
    rating: number;
    rating_string?: string;
    title?: string;
    prostava_data: ProstavaData;
    participants: ProstavaParticipant[];
    participants_string?: string;
    participants_min_count?: number;
    participants_max_count?: number;
    closing_date?: Date;
    creation_date?: Date;
}

export interface ProstavaDocument extends Prostava, Document {
    _id: Types.ObjectId;
}

export interface ProstavaModel extends Model<ProstavaDocument> {}
