import { Group, Prostava, UpdateContext, User, UserStats } from "../types";
import { UserUtils } from "./user";
import { ProstavaUtils } from "./prostava";
import { TelegramUtils } from "./telegram";
import { RegexUtils } from ".";

export class StatsUtils {
    static getUsersTotalRating(users: Group["users"], prostavas: Group["prostavas"], year?: number): UserStats[] {
        const usersStats: UserStats[] = [];
        if (year) {
            const prostavasAll = ProstavaUtils.filterProstavasByYear(prostavas, year);
            const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
            const prostavasRejected = ProstavaUtils.filterRejectedProstavas(prostavasAll);
            if (prostavasApproved.length) {
                this.getUsersAll(users, prostavasAll).forEach((user) => {
                    usersStats.push({
                        user: user,
                        rating: (
                            ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id).length -
                            ProstavaUtils.filterUserProstavas(prostavasRejected, user.user_id).length +
                            ProstavaUtils.filterParticipantProstavas(prostavasApproved, user.user_id).length /
                                prostavasApproved.length +
                            ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id).reduce(
                                (average, prostava, index, prostavas) => average + prostava.rating / prostavas.length,
                                0
                            )
                        )
                            .toFixed(1)
                            .toString()
                    });
                });
            }
        } else {
            const years = this.getYearsAll(prostavas);
            years.forEach((year) => {
                const usersStatsYear = this.getUsersTotalRating(users, prostavas, year);
                usersStatsYear.forEach((userStatsYear) => {
                    const userIndex = usersStats.findIndex(
                        (userStats) => userStats.user.user_id === userStatsYear.user.user_id
                    );
                    if (userIndex >= 0) {
                        usersStats[userIndex].rating += userStatsYear.rating;
                    } else {
                        usersStats.push(userStatsYear);
                    }
                });
            });
        }
        return usersStats;
    }

    static getUsersAverageRating(users: Group["users"], prostavas: Group["prostavas"], year?: number): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id)
                        .reduce(
                            (average, prostava, index, prostavas) => average + prostava.rating / prostavas.length,
                            0
                        )
                        .toFixed(1)
                        .toString()
                });
            });
        }
        return usersStats;
    }
    static getUsersMaxRating(users: Group["users"], prostavas: Group["prostavas"], year?: number): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id)
                        .reduce((max, prostava) => (max < prostava.rating ? prostava.rating : max), 0)
                        .toFixed(1)
                        .toString()
                });
            });
        }
        return usersStats;
    }
    static getUsersMinRating(users: Group["users"], prostavas: Group["prostavas"], year?: number): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id)
                        .reduce((min, prostava) => (!min || min > prostava.rating ? prostava.rating : min), 0)
                        .toFixed(1)
                        .toString()
                });
            });
        }
        return usersStats;
    }

    static getUsersApprovedProstavasNumber(
        users: Group["users"],
        prostavas: Group["prostavas"],
        year?: number
    ): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id).length.toString()
                });
            });
        }
        return usersStats;
    }
    static getUsersRejectedProstavasNumber(
        users: Group["users"],
        prostavas: Group["prostavas"],
        year?: number
    ): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasRejected = ProstavaUtils.filterRejectedProstavas(prostavasAll);
        if (prostavasRejected.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasRejected, user.user_id).length.toString()
                });
            });
        }
        return usersStats;
    }
    static getUsersParticipationsNumber(
        users: Group["users"],
        prostavas: Group["prostavas"],
        year?: number
    ): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasAll = year ? ProstavaUtils.filterProstavasByYear(prostavas, year) : prostavas;
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavasAll);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavasAll).forEach((user) => {
                usersStats.push({
                    user: user,
                    rating: ProstavaUtils.filterParticipantProstavas(prostavasApproved, user.user_id).length.toString()
                });
            });
        }
        return usersStats;
    }

    static getYearsAll(prostavas: Group["prostavas"]): number[] {
        const years = new Set<number>();
        (prostavas as Prostava[]).forEach((prostava) => {
            if (prostava.closing_date) {
                years.add(prostava.closing_date.getFullYear());
            }
        });
        return Array.from(years);
    }
    static getCommandYear(ctx: UpdateContext): number | undefined {
        const commandText = TelegramUtils.getMessageCommandText(ctx);
        return RegexUtils.matchYear().test(commandText) ? Number(commandText) : undefined;
    }
    static getUsersAll(users: Group["users"], prostavas: Group["prostavas"]): User[] {
        const usersAll = new Set<User>();
        UserUtils.filterRealUsers(users).forEach((user) => {
            usersAll.add(user as User);
        });
        prostavas.forEach((prostava) => {
            usersAll.add((prostava as Prostava).author as User);
        });
        return Array.from(usersAll);
    }
    static sortAndPadUsersStatsByRating(usersStats: UserStats[], descending = true): UserStats[] {
        const usersStatsSorted = usersStats.sort((a, b) =>
            descending ? Number(b.rating) - Number(a.rating) : Number(a.rating) - Number(b.rating)
        );
        const ratingMaxLength = usersStats.reduce(
            (length, userStats) => (length < userStats.rating.length ? userStats.rating.length : length),
            0
        );
        return usersStatsSorted.map((userStats) => ({
            ...userStats,
            rating: userStats.rating.padStart(ratingMaxLength, " ")
        }));
    }
}
