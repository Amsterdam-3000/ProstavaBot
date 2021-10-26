import { Router } from "express";

import { ApiUserMiddleware } from "../middlewares";
import { ApiGroupController } from "../controllers";

import { userRouter } from "./user";

export const groupRouter = Router();

groupRouter.route("/").get(ApiGroupController.getGroup);
groupRouter
    .route("/")
    .patch(ApiUserMiddleware.addUserToRequest, ApiUserMiddleware.isUserAdmin, ApiGroupController.updateGroup);

groupRouter.route("/languages").get(ApiGroupController.getGroupLanguages);
groupRouter.route("/currencies").get(ApiGroupController.getGroupCurrencies);
groupRouter.route("/users").get(ApiGroupController.getGroupUsers);
// groupRouter.route("/prostavas").get(ApiGroupController.getGroupProstavas);

//User routes
groupRouter.use("/user/:userId", ApiUserMiddleware.addUserToRequest, userRouter);

//TODO Prostava routes
