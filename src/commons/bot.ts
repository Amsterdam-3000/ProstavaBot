import { Telegraf } from "telegraf";
import { UpdateContext } from "./interfaces";
import { CONFIG } from "./config";

//Create bot instance
export const bot = new Telegraf<UpdateContext>(CONFIG.TELEGRAM_TOKEN);
