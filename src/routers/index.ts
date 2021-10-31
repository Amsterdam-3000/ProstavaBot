import { Router } from "express";

import { ApiAuthMiddleware } from "../middlewares";

import { calendarRouter } from "./calendar";
import { authRouter } from "./auth";
import { appRouter } from "./app";
import { globalRouter } from "./global";

export const apiRouter = Router();

//Global Routes
apiRouter.use("/global", globalRouter);
//Calendar Routes
apiRouter.use("/calendar", calendarRouter);
//Auth Routes
apiRouter.use("/auth", authRouter);
//App Routes
apiRouter.use("/app", ApiAuthMiddleware.checkUserAuth, appRouter);
