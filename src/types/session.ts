import { Scenes } from "telegraf";
import { Document, Model, Types } from "mongoose";

export interface SessionData {
    chat_id?: number;
}

export interface Session {
    _id: Types.ObjectId;
    key: string;
    data: SessionData;
}

export interface SceneSession extends Scenes.SceneSession, SessionData {}

export interface SessionDocument extends Session, Document {
    _id: Types.ObjectId;
}

export interface SessionModel extends Model<SessionDocument> {}
