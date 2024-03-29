export class DateUtils {
    static getWeekDayNames(language: string): string[] {
        const dates: Array<Date> = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates
            .sort((a, b) => (a.getDay() || 7) - (b.getDay() || 7))
            .map((date) => this.getWeekDayName(language, date));
    }

    static getMonthNames(language: string): string[] {
        const dates: Array<Date> = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            dates.push(date);
        }
        return dates.sort((a, b) => a.getMonth() - b.getMonth()).map((date) => this.getMonthName(language, date));
    }

    static getDateString(language: string, date: Date | undefined): string | undefined {
        return date?.toLocaleString(language, {
            year: "numeric",
            month: "short",
            weekday: "short",
            day: "numeric"
        });
    }
    static getTimeString(language: string, timezone: string, date: Date | undefined): string | undefined {
        return date?.toLocaleTimeString(language, {
            timeZone: timezone,
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    static getDateTimeString(language: string, timezone: string, date: Date | undefined): string | undefined {
        return date?.toLocaleString(language, {
            year: "numeric",
            month: "short",
            weekday: "short",
            day: "numeric",
            timeZone: timezone,
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    static getWeekDayName(language: string, date: Date): string {
        return date.toLocaleString(language, { weekday: "short" })[0];
    }
    static getMonthName(language: string, date: Date): string {
        return date.toLocaleString(language, { month: "short" });
    }

    static repeatDateYearlyFromTo(date: Date, from: Date, to: Date): Date[] {
        const dates: Date[] = [];
        let year = from.getFullYear();
        do {
            const repeatDate = new Date(date.getTime());
            repeatDate.setFullYear(year);
            dates.push(repeatDate);
            year++;
        } while (year < to.getFullYear());
        return dates;
    }
    static getFirstDayOfYear(date: Date): Date {
        const firstDay = new Date(date.getTime());
        firstDay.setMonth(0);
        firstDay.setDate(1);
        return firstDay;
    }
    static getLastDayOfYear(date: Date): Date {
        const lastDay = new Date(date.getTime());
        lastDay.setFullYear(lastDay.getFullYear() + 1);
        lastDay.setMonth(0);
        lastDay.setDate(0);
        return lastDay;
    }
    static getDateDaysAgo(days: number): Date {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }
    static getDateDaysAfter(days: number, date = new Date()): Date {
        const newDate = new Date(date.getTime());
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }
    static getHoursFromDateToNow(date: Date): number {
        return (new Date().getTime() - date.getTime()) / 36e5;
    }
    static getNowDatePlusHours(hours: number): Date {
        const date = new Date();
        date.setTime(date.getTime() + hours * 36e5);
        return date;
    }
    static getNowDateNextWeek(): Date {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
    }

    static toYyyymmdd(date: Date): string {
        const mm = date.getMonth() + 1;
        const dd = date.getDate();
        return [date.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("-");
    }
}
