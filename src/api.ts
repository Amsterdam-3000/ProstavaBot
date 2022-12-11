import { CONFIG } from "./commons/config";
import { app } from "./commons/express";
import { ApiGlobalMiddleware } from "./middlewares";
import { apiRouter } from "./routers";

export function launchServer(): void {
    //Global
    app.use(ApiGlobalMiddleware.addBodyToRequestFromUrl);
    app.use(ApiGlobalMiddleware.addBodyToRequestFromJson);
    app.use(ApiGlobalMiddleware.addCorsHeaderToResponse);
    app.use(ApiGlobalMiddleware.addLoggingRequest);

    //API Routes
    app.use("/api", apiRouter);

    app.listen(CONFIG.PROSTAVA_PORT, () => {
        console.log(`Prostava API is listening on port ${CONFIG.PROSTAVA_PORT}`);
    });
}
