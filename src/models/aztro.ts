import zodiacSigns from "zodiac-signs";
import fetch from "node-fetch";
import { Aztro } from "../types";

export class AztroModel {
    private static async getHoroscope(birthday: Date, day: string) {
        let aztro: Aztro = {
            ...zodiacSigns().getSignByDate({
                day: birthday.getDate(),
                month: birthday.getMonth() + 1
            })
        };
        const url = `https://aztro.sameerkumar.website/?sign=${aztro.name.toLowerCase()}&day=${day}`;
        const response = await fetch(url, { method: "POST" });
        aztro = { ...aztro, ...(await response.json()) };
        console.log();
        return aztro;
    }

    public static getTodayHoroscope(birthday: Date) {
        return this.getHoroscope(birthday, "today");
    }
}
