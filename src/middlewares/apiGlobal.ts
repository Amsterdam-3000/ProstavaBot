import { urlencoded, json } from "body-parser";
import cors from "cors";
import morgan from "morgan";

morgan.token("req-headers", function getReqHeaders(req) {
    return JSON.stringify(req.headers, null, 1);
});

export class ApiGlobalMiddleware {
    static addBodyToRequestFromUrl = urlencoded({ extended: false });
    static addBodyToRequestFromJson = json();
    static addCorsHeaderToResponse = cors({ allowedHeaders: ["Content-Type", "Authorization"] });
    static addLoggingRequest = morgan(
        ":remote-addr - :remote-user [:date[clf]]\n" + ":method :url HTTP/:http-version :status\n" + ":req-headers\n"
    );
}
