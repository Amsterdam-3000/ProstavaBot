import { Scenes, Context } from "telegraf";
import { I18nContext } from "@edjopato/telegraf-i18n";
import { GroupDocument } from "./mongoose";

interface GroupSession extends Scenes.SceneSession {
    group: GroupDocument;
}

export interface UpdateContext extends Context {
    readonly i18n: I18nContext;
    scene: Scenes.SceneContextScene<UpdateContext>;
    session: GroupSession;
    help: string;
}
