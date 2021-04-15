export class DateUtils {
    static getWeekDayNames(language: string) {
        let dates: Array<Date> = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates.sort((a, b) => b.getDate() - a.getDay()).map((date) => this.getWeekDayName(language, date));
    }

    static getMonthNames(language: string) {
        let dates: Array<Date> = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            dates.push(date);
        }
        return dates.sort((a, b) => a.getMonth() - b.getMonth()).map((date) => this.getMonthName(language, date));
    }

    static getDateString(language: string, date: Date) {
        return date?.toLocaleString(language, {
            year: "numeric",
            month: "short",
            weekday: "short",
            day: "numeric"
        });
    }
    static getWeekDayName(language: string, date: Date) {
        return date.toLocaleString(language, { weekday: "short" })[0];
    }
    static getMonthName(language: string, date: Date) {
        return date.toLocaleString(language, { month: "short" });
    }

    static getDateDaysAgo(days: number) {
        if (days > 0) {
            const date = new Date();
            return date.setDate(date.getDate() - days);
        }
        return null;
    }
}
