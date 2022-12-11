import { Router } from "express";

import { ApiAuthMiddleware, ApiTelegramMiddleware, ApiUserMiddleware } from "../middlewares";
import { ApiUserController } from "../controllers";
import { PROSTAVA } from "../constants";

export const userRouter = Router();

userRouter.route("/").get(ApiUserController.getUser);
userRouter
    .route("/")
    .patch(
        ApiAuthMiddleware.isUserMe,
        ApiUserMiddleware.addUserPersonalDataFromBody,
        ApiUserMiddleware.canUpdateUser,
        ApiUserMiddleware.saveUser,
        ApiTelegramMiddleware.executeBotCommandInChat(PROSTAVA.COMMAND.PROFILE),
        ApiUserController.getUser
    );
