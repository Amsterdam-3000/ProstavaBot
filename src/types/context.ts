import { Scenes, Context } from "telegraf";
import { I18nContext } from "@edjopato/telegraf-i18n";
import { Group, User } from ".";

interface ContextSession extends Scenes.SceneSession {
    group: Group;
    user: User;
}

export interface UpdateContext extends Context {
    readonly i18n: I18nContext;
    scene: Scenes.SceneContextScene<UpdateContext>;
    session: ContextSession;
    help: string;
}
