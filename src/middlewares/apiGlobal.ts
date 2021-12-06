import { NextFunction, Request, Response } from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { i18n } from "../commons/locale";

//TODO ???
morgan.token("req-headers", function getReqHeaders(req) {
    return JSON.stringify(req.headers, null, 1);
});

export class ApiGlobalMiddleware {
    static addBodyToRequestFromUrl = urlencoded({ extended: false });
    static addBodyToRequestFromJson = json();
    static addCorsHeaderToResponse = cors();
    static addLoggingRequest = morgan(
        ":remote-addr - :remote-user [:date[clf]]\n" + ":method :url HTTP/:http-version :status\n" + ":req-headers\n"
    );

    static async addI18nToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.i18n = i18n.createContext(req.params.language || req.group.settings.language, {});
        //TODO Check Errors?
        next();
    }
}
