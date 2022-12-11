import { Scenes, Context } from "telegraf";
import { I18nContext } from "@grammyjs/i18n";
import { Group, User } from ".";
import { SceneSession } from "./session";
import { Prostava } from "./prostava";

export interface UpdateContext extends Context {
    readonly i18n: I18nContext;
    session: SceneSession;
    scene: Scenes.SceneContextScene<UpdateContext>;
    group: Group;
    user: User;
    prostava?: Prostava;
    prostavas?: Prostava[];
    groups?: Group[];
}
