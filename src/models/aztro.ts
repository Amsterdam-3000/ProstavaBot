import zodiacSigns from "zodiac-signs";
import axios from "axios";
import { Aztro } from "../types";
import { ConverterUtils } from "../utils";

export class AztroModel {
    private static async getHoroscope(birthday: Date, day: string): Promise<Aztro> {
        let aztro: Aztro = {
            ...zodiacSigns().getSignByDate({
                day: birthday.getDate(),
                month: birthday.getMonth() + 1
            })
        };
        const url = `https://aztro.sameerkumar.website/?sign=${aztro.name.toLowerCase()}&day=${day}`;
        //TODO fix this
        const response = await axios.post(url);
        aztro = { ...aztro, ...response.data };
        aztro.photo = ConverterUtils.getEmojiImageUrl(aztro.symbol);
        return aztro;
    }

    public static getTodayHoroscope(birthday: Date | undefined): Promise<Aztro> | undefined {
        if (!birthday) {
            return undefined;
        }
        return this.getHoroscope(birthday, "today");
    }
}
