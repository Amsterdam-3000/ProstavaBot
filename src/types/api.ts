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
