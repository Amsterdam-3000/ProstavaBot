import { Router } from "express";

import { ApiAuthController } from "../controllers";

export const authRouter = Router();

authRouter.post("/login", ApiAuthController.loginToProstavaWeb);
//TODO logout
