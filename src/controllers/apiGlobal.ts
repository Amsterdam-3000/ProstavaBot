import { Request, Response } from "express";

import { ApiUtils } from "../utils";
import { AztroModel } from "../models";

export class ApiGlobalController {
    static async getLanguages(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.getLanguageObjects(req.i18n));
    }
    static async getCurrencies(req: Request, res: Response): Promise<void> {
        res.json(ApiUtils.getCurrencyObjects(req.i18n));
    }

    static async getAztro(req: Request, res: Response): Promise<void> {
        const birthday = new Date(req.params.birthday);
        if (isNaN(birthday.getTime())) {
            res.sendStatus(406);
            return;
        }
        res.json(await AztroModel.getTodayHoroscope(birthday));
    }
}
