import { Router } from "express";

import { ApiGlobalController } from "../controllers";

export const localeRouter = Router();

localeRouter.route("/languages").get(ApiGlobalController.getLanguages);
localeRouter.route("/currencies").get(ApiGlobalController.getCurrencies);

localeRouter.route("/aztro/:birthday").get(ApiGlobalController.getAztro);
