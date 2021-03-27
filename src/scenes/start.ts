import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { UpdateContext } from "../commons/interfaces";

export const startScene = new Scenes.BaseScene<UpdateContext>(SCENE.START);

//TODO controllers
//TEST
startScene.enter((ctx) => ctx.reply("Hi"));
startScene.leave((ctx) => ctx.reply("Bye"));
