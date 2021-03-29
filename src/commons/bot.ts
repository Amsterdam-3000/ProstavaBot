import { Telegraf } from "telegraf";
import { UpdateContext } from "../types/telegraf";
import { CONFIG } from "./config";

//Create bot instance
export const bot = new Telegraf<UpdateContext>(CONFIG.TELEGRAM_TOKEN);
