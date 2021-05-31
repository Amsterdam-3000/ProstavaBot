import { resolve } from "path";
import { config } from "dotenv";

//Read .env file in the private folder and assign contents to process.env
config({ path: resolve(process.cwd(), "private", ".env") });

export const CONFIG = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URI: process.env.REDIS_URI,
    PROSTAVA_HOST: process.env.HOST,
    PROSTAVA_PORT: process.env.PORT,
    SUPER_ADMIN_ID: Number(process.env.SUPER_ADMIN_ID),
    HOME: process.env.HOME || process.cwd(),
};
