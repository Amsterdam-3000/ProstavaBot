import { Router } from "express";
import { ApiUtils } from "../utils";

export const localeRouter = Router();

localeRouter.route("/languages").get((req, res) => {
    res.json(ApiUtils.getLanguageObjects(req.i18n));
});
localeRouter.route("/currencies").get((req, res) => {
    res.json(ApiUtils.getCurrencyObjects(req.i18n));
});
