import { Scenes, Context } from "telegraf";
import { I18nContext } from "@edjopato/telegraf-i18n";

export interface UpdateContext extends Context {
    readonly i18n: I18nContext;
    scene: Scenes.SceneContextScene<UpdateContext>;
}
