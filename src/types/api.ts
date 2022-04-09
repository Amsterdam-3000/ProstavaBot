import { ProstavaStatus } from "./prostava";

export interface ApiBaseObject {
    id: string;
    name?: string;
    link?: string;
    emoji?: string;
    photo?: string;
    string?: string;
    readonly?: boolean;
}

export interface ApiGroup extends ApiBaseObject {
    language: string;
    currency: string;
    prostava_types: ApiBaseObject[];
    timezone: string;
    create_days_ago: number;
    chat_members_count: number;
    chat_members_all: number;
    participants_min_percent: number;
    pending_hours: number;
    calendar_apple?: string;
    calendar_google?: string;
}

export interface ApiUser extends ApiBaseObject {
    birthday: Date | null;
}

export interface ApiProstavaVenue extends ApiBaseObject {
    address: string;
    longitude: number;
    latitude: number;
}

export interface ApiProstavaParticipant {
    user: ApiBaseObject;
    rating: number;
}

export interface ApiProstava extends ApiBaseObject {
    author: ApiBaseObject;
    status: ProstavaStatus;
    creator: ApiBaseObject;
    is_request: boolean;
    is_preview: boolean;
    rating: number;
    date: Date;
    timezone: string;
    venue: ApiProstavaVenue;
    amount?: number;
    currency?: string;
    participants?: ApiProstavaParticipant[];
    participants_min_count?: number;
    participants_max_count?: number;
    creation_date?: Date;
    closing_date?: Date;
    canWithdraw?: boolean;
    canRate?: boolean;
}
