import { Router } from "express";

import { ApiUserMiddleware } from "../middlewares";
import { ApiGroupController } from "../controllers";

import { userRouter } from "./user";

export const groupRouter = Router();

groupRouter.route("/").get(ApiGroupController.getGroup);
groupRouter.route("/users").get(ApiGroupController.getGroupUsers);
// groupRouter.route("/prostavas").get(ApiGroupController.getGroupProstavas);

//User routes
groupRouter.use("/user/:userId", ApiUserMiddleware.addUserToRequest, userRouter);

//TODO Prostava routes
