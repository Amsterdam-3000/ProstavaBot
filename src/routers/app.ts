import { Router } from "express";

import { ApiGroupMiddleware, ApiGlobalMiddleware, ApiAuthMiddleware, ApiTelegramMiddleware } from "../middlewares";
import { ApiGroupController } from "../controllers";

import { groupRouter } from "./group";

export const appRouter = Router();

appRouter.route("/groups").get(ApiGroupController.getGroups);

//Group routes
appRouter.use(
    "/group/:groupId",
    ApiGroupMiddleware.addGroupToRequest,
    ApiAuthMiddleware.isMyGroup,
    ApiTelegramMiddleware.addChatDataToRequest,
    ApiGlobalMiddleware.addI18nToRequest,
    groupRouter
);
