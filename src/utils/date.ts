export class DateUtils {
    static getWeekDayNames(language: string) {
        const dates: Array<Date> = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates.sort((a, b) => b.getDate() - a.getDay()).map((date) => this.getWeekDayName(language, date));
    }

    static getMonthNames(language: string) {
        const dates: Array<Date> = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            dates.push(date);
        }
        return dates.sort((a, b) => a.getMonth() - b.getMonth()).map((date) => this.getMonthName(language, date));
    }

    static getDateString(language: string, date: Date | undefined) {
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
        if (!days) {
            return null;
        }
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }
    static getHoursFromDateToNow(date: Date) {
        return (new Date().getTime() - date.getTime()) / 36e5;
    }
    static getNowDatePlusHours(hours: number) {
        const date = new Date();
        date.setTime(date.getTime() + hours * 36e5);
        return date;
    }

    static getZodiacSignByBirthdate(birthday: Date) {
        const month = birthday.getMonth() + 1;
        const day = birthday.getDate();
        if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) {
            return "♑️";
        } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
            return "♒️";
        } else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
            return "♓️";
        } else if ((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
            return "♈️";
        } else if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
            return "♉️";
        } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
            return "♊️";
        } else if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
            return "♋️";
        } else if ((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
            return "♌️";
        } else if ((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
            return "♍️";
        } else if ((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
            return "♎️";
        } else if ((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
            return "♏️";
        } else if ((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
            return "♐️";
        }
    }
}
