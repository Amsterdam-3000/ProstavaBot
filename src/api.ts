import { CONFIG } from "./commons/config";
import { server } from "./commons/server";
import { ApiGlobalMiddleware } from "./middlewares";
import { apiRouter } from "./routers";

export function launchServer(): void {
    //Global
    server.use(ApiGlobalMiddleware.addBodyToRequestFromUrl);
    server.use(ApiGlobalMiddleware.addBodyToRequestFromJson);
    server.use(ApiGlobalMiddleware.addCorsHeaderToResponse);
    server.use(ApiGlobalMiddleware.addLoggingRequest);

    //API Routes
    server.use("/api", apiRouter);

    server.listen(CONFIG.PROSTAVA_PORT, () => {
        console.log(`Prostava API is listening on port ${CONFIG.PROSTAVA_PORT}`);
    });
}
