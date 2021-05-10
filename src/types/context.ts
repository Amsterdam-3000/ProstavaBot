import { Scenes, Context } from "telegraf";
import { I18nContext } from "@edjopato/telegraf-i18n";
import { Group, User } from ".";
import { Prostava } from "./prostava";
import { Chat } from "telegraf/typings/core/types/typegram";

interface ContextSession extends Scenes.SceneSession {
    chat?: Chat;
}

export interface UpdateContext extends Context {
    readonly i18n: I18nContext;
    session: ContextSession;
    scene: Scenes.SceneContextScene<UpdateContext>;     
    group: Group;
    user: User;
    prostava?: Prostava;
    prostavas?: Prostava[];
}
