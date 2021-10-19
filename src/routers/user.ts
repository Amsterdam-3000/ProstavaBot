import { Router } from "express";

import { ApiUserController } from "../controllers";

export const userRouter = Router();

userRouter.route("/").get(ApiUserController.getUser);
