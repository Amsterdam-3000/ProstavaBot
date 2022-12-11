import { Router } from "express";
import { ApiAuthMiddleware } from "../middlewares";

import { ApiAuthController } from "../controllers";

export const authRouter = Router();

authRouter.post("/login/app", ApiAuthController.loginToProstavaApp);
authRouter.post("/login/webapp", ApiAuthController.loginToProstavaWebApp);

authRouter.post("/logout", ApiAuthMiddleware.checkUserAuth, (req, res) => {
    //TODO Some action?
    res.json({});
});
