import expressJwt from "express-jwt";

import { CONFIG } from "../commons/config";

export class AuthMiddleware {
    static checkUserAuth = () => {
        return expressJwt({ secret: CONFIG.TELEGRAM_TOKEN!, algorithms: ["HS256"] }).unless({
            path: [
                // public routes that don't require authentication
                /^\/api\/calendar/,
                /^\/api\/login/
            ]
        });
    };
}
