import { Router } from "express";

import { ApiGroupMiddleware, ApiGlobalMiddleware } from "../middlewares";
import { ApiGroupController } from "../controllers";

import { groupRouter } from "./group";

export const appRouter = Router();

appRouter.route("/groups").get(ApiGroupController.getGroups);

//Group routes
appRouter.use(
    "/group/:groupId",
    ApiGroupMiddleware.addGroupToRequest,
    ApiGlobalMiddleware.addI18nToRequest,
    groupRouter
);
