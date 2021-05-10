
import { Message } from "telegraf/typings/core/types/typegram";

export interface SceneState {
    messageId?: Message["message_id"];
    command?: string;
    actionData?: string;
    prostavaId?: string;
}