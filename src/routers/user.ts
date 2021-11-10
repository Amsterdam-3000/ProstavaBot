import { Router } from "express";

import { ApiAuthMiddleware, ApiUserMiddleware } from "../middlewares";
import { ApiUserController } from "../controllers";

export const userRouter = Router();

userRouter.route("/").get(ApiUserController.getUser);
userRouter.route("/").patch(ApiAuthMiddleware.isUserMe, ApiUserMiddleware.canUpdateUser, ApiUserController.updateUser);
