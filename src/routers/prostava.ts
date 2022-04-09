import { Router } from "express";

import { ApiAuthMiddleware, ApiGroupMiddleware, ApiProstavaMiddleware } from "../middlewares";
import { ApiProstavaController } from "../controllers";

export const prostavaRouter = Router();

prostavaRouter.route("/").get(ApiProstavaMiddleware.isProstavaExists, ApiProstavaController.getProstava);

prostavaRouter
    .route("/announce")
    .put(
        ApiAuthMiddleware.isProstavaAnnouncerMe,
        ApiProstavaMiddleware.addProstavaDataFromBody,
        ApiProstavaMiddleware.canAnnounceProstava,
        ApiProstavaMiddleware.announceProstava,
        ApiGroupMiddleware.saveGroup,
        ApiProstavaMiddleware.saveProstava,
        ApiProstavaController.getProstava
    );
prostavaRouter
    .route("/withdraw")
    .put(
        ApiAuthMiddleware.isProstavaAnnouncerMe,
        ApiProstavaMiddleware.canWithdrawProstava,
        ApiProstavaMiddleware.withdrawProstava,
        ApiProstavaMiddleware.saveProstava,
        ApiProstavaController.getProstava
    );
