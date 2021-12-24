import { Router } from "express";

import {
    ApiGroupMiddleware,
    ApiProstavaMiddleware,
    ApiUserMiddleware,
    ApiTelegramMiddleware,
    ApiAuthMiddleware
} from "../middlewares";
import { ApiGroupController, ApiProstavaController } from "../controllers";

import { userRouter } from "./user";
import { prostavaRouter } from "./prostava";

export const groupRouter = Router();

groupRouter.route("/").get(ApiTelegramMiddleware.addMemberDataToRequest, ApiGroupController.getGroup);
groupRouter
    .route("/")
    .patch(
        ApiTelegramMiddleware.addMemberDataToRequest,
        ApiAuthMiddleware.isUserAdmin,
        ApiGroupMiddleware.addGroupSettingsFromBody,
        ApiGroupMiddleware.canUpdateGroup,
        ApiGroupMiddleware.saveGroup,
        ApiGroupController.getGroup
    );

groupRouter.route("/users").get(ApiGroupController.getGroupUsers);
groupRouter.route("/prostavas").get(ApiGroupController.getGroupProstavas);

//User routes
groupRouter.use("/user/:userId", ApiUserMiddleware.addUserToRequest, userRouter);

//Prostava routes
groupRouter
    .route("/prostava")
    .get(
        ApiUserMiddleware.addUserToRequest,
        ApiProstavaMiddleware.addProstavaToRequest,
        ApiProstavaController.getProstava
    );
groupRouter.use(
    "/prostava/:prostavaId",
    ApiUserMiddleware.addUserToRequest,
    ApiProstavaMiddleware.addProstavaToRequest,
    prostavaRouter
);
