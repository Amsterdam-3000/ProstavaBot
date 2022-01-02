import { Group, Prostava, User, UserStats } from "../types";
import { UserUtils } from "./user";
import { ProstavaUtils } from "./prostava";

export class StatsUtils {
    static getUsersTotalRating(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        const prostavasRejected = ProstavaUtils.filterRejectedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
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
        return this.sortAndPadUsersStatsByRating(usersStats);
    }

    static getUsersAverageRating(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
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
        return this.sortAndPadUsersStatsByRating(usersStats);
    }
    static getUsersMaxRating(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id)
                        .reduce((max, prostava) => (max < prostava.rating ? prostava.rating : max), 0)
                        .toFixed(1)
                        .toString()
                });
            });
        }
        return this.sortAndPadUsersStatsByRating(usersStats);
    }
    static getUsersMinRating(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id)
                        .reduce((min, prostava) => (!min || min > prostava.rating ? prostava.rating : min), 0)
                        .toFixed(1)
                        .toString()
                });
            });
        }
        return this.sortAndPadUsersStatsByRating(usersStats);
    }

    static getUsersApprovedProstavasNumber(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasApproved, user.user_id).length.toString()
                });
            });
        }
        return this.sortAndPadUsersStatsByRating(usersStats);
    }
    static getUsersRejectedProstavasNumber(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasRejected = ProstavaUtils.filterRejectedProstavas(prostavas);
        if (prostavasRejected.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
                    user: user,
                    rating: ProstavaUtils.filterUserProstavas(prostavasRejected, user.user_id).length.toString()
                });
            });
        }
        return this.sortAndPadUsersStatsByRating(usersStats);
    }
    static getUsersParticipationsNumber(users: Group["users"], prostavas: Group["prostavas"]): UserStats[] {
        const usersStats: UserStats[] = [];
        const prostavasApproved = ProstavaUtils.filterApprovedProstavas(prostavas);
        if (prostavasApproved.length) {
            this.getUsersAll(users, prostavas).forEach((user) => {
                usersStats.push({
                    emoji: "",
                    user: user,
                    rating: ProstavaUtils.filterParticipantProstavas(prostavasApproved, user.user_id).length.toString()
                });
            });
        }
        return this.sortAndPadUsersStatsByRating(usersStats);
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
