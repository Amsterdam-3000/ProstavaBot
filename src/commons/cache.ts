import { MemorySessionStore } from "telegraf";

//TODO Redis session
export const cache = new MemorySessionStore<object>();
