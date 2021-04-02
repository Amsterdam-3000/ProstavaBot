import { session } from "telegraf";
import { mainStage } from "../scenes";

//TODO Redis session
export const addSessionToContext = session();

export const addStageToSession = mainStage.middleware();
