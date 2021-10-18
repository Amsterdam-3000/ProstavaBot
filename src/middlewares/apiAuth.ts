import expressJwt from "express-jwt";

import { CONFIG } from "../commons/config";

export class ApiAuthMiddleware {
    static checkUserAuth = expressJwt({ secret: CONFIG.TELEGRAM_TOKEN!, algorithms: ["HS256"] });
}
