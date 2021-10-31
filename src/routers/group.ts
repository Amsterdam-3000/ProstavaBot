import { Router } from "express";

import { ApiAuthMiddleware, ApiUserMiddleware } from "../middlewares";
import { ApiGroupController } from "../controllers";

import { userRouter } from "./user";

export const groupRouter = Router();

groupRouter.route("/").get(ApiAuthMiddleware.isUserAdmin(), ApiGroupController.getGroup);
groupRouter
    .route("/")
    //TODO Add Fields Checks Middleware
    .patch(ApiAuthMiddleware.isUserAdmin(true), ApiUserMiddleware.addUserToRequest, ApiGroupController.updateGroup);

groupRouter.route("/users").get(ApiGroupController.getGroupUsers);
// groupRouter.route("/prostavas").get(ApiGroupController.getGroupProstavas);

//User routes
groupRouter.use("/user/:userId", ApiUserMiddleware.addUserToRequest, userRouter);

//TODO Prostava routes
