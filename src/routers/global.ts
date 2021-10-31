import { Router } from "express";
import { ApiGlobalMiddleware } from "../middlewares";
import { ConverterUtils } from "../utils";
import { localeRouter } from "./locale";

export const globalRouter = Router();

globalRouter.use("/:language", ApiGlobalMiddleware.addI18nToRequest, localeRouter);

globalRouter.route("/emojiPhoto/:emoji").get((req, res) => {
    res.json(ConverterUtils.getEmojiImageUrl(req.params.emoji));
});
