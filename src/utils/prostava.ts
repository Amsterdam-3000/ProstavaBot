import { Types, Error } from "mongoose";
import { Venue } from "telegraf/typings/core/types/typegram";
import { CODE, PROSTAVA } from "../constants";
import {
    Group,
    Prostava,
    ProstavaCost,
    ProstavaDocument,
    ProstavaParticipant,
    ProstavaStatus,
    ProstavaType,
    User
} from "../types";
import { DateUtils } from "./date";
import { RegexUtils } from "./regex";
import { ConverterUtils } from "./converter";
import { ProstavaCollection } from "../models";
import { UserUtils } from "./user";
import { GroupUtils } from "./group";
import { DateTime } from "luxon";

export class ProstavaUtils {
    static createProstavaFromText(
        group: Group,
        user: User,
        text: string,
        isRequest = false,
        id?: string
    ): ProstavaDocument {
        let author = isRequest ? undefined : user;
        let prostavaType = CODE.COMMAND.PROSTAVA;
        let prostavaTitle: string | undefined;
        const prostavaData = text?.split("|") || [];
        if (isRequest && RegexUtils.matchNumber().test(prostavaData[0])) {
            author = UserUtils.findUserByUserId(group.users, Number(prostavaData[0]));
            prostavaData.shift();
        }
        if (RegexUtils.matchOneEmoji().test(prostavaData[0])) {
            prostavaType = prostavaData[0];
            prostavaTitle = GroupUtils.findProstavaTypeByEmoji(group, prostavaType)?.text;
            prostavaData.shift();
        }
        const prostava = new ProstavaCollection({
            _id: new Types.ObjectId(id),
            group_id: group._id,
            author: author,
            creator: user,
            creation_date: new Date(),
            is_request: isRequest,
            prostava_data: {
                type: prostavaType,
                title:
                    prostavaData[0] && RegexUtils.matchTitle().test(prostavaData[0])
                        ? prostavaData[0]
                        : prostavaTitle || "",
                date: this.fillProstavaDateFromText(prostavaData[1], group.settings),
                timezone: group.settings.timezone,
                venue: {
                    title: prostavaData[2] && RegexUtils.matchTitle().test(prostavaData[2]) ? prostavaData[2] : ""
                },
                cost: this.fillProstavaCostFromText(prostavaData[3], group.settings.currency)
            }
        });
        if (this.canAnnounceProstava(prostava)) {
            this.announceProstava(prostava, group.settings);
        }
        return prostava;
    }
    static fillProstavaCostFromText(costText: string, currency?: string): ProstavaCost {
        const cost = costText?.split(/(?=\p{Sc})/u) || [];
        return {
            amount: Number(cost[0]),
            currency: cost[1] || currency
        };
    }
    static fillProstavaDateFromText(dateText: string, settings: Group["settings"]): Date {
        const dateNow = new Date(Date.now());
        //TODO Default hours
        dateNow.setHours(20);
        if (!dateText || !RegexUtils.matchDate().test(dateText)) {
            return dateNow;
        }
        const dateIn = new Date(dateText);
        //TODO Default hours
        dateIn.setHours(20);
        const dateAgo = DateUtils.getDateDaysAgo(settings.create_days_ago);
        if ((dateAgo && dateIn.getTime() < dateAgo.getTime()) || dateIn.getTime() > dateNow.getTime()) {
            return dateNow;
        }
        return dateIn;
    }
    static fillFakeProstavaFromUser(user: User): ProstavaDocument {
        return new ProstavaCollection({ status: "", author: user, prostava_data: {} });
    }
    static getProstavaId(prostava: Prostava): string {
        return (prostava as ProstavaDocument).id;
    }

    static changeProstavaDate(prostava: Prostava, dateText: string): void {
        const date = new Date(dateText);
        date.setHours(prostava.prostava_data.date.getHours());
        date.setMinutes(prostava.prostava_data.date.getMinutes());
        prostava.prostava_data.date = date;
    }
    static changeProstavaTime(prostava: Prostava, timeText: string): void {
        const time = timeText.split(":");
        const dateTime = DateTime.fromJSDate(prostava.prostava_data.date)
            .setZone(prostava.prostava_data.timezone)
            .set({ hour: Number(time[0]), minute: Number(time[1]) });
        prostava.prostava_data.date = dateTime.toJSDate();
    }
    static announceProstava(prostava: Prostava, settings: Group["settings"]): void {
        prostava.status = ProstavaStatus.Pending;
        prostava.participants_max_count = settings.chat_members_count - 1;
        prostava.participants_min_count = Math.ceil(
            (prostava.participants_max_count * settings.participants_min_percent) / 100
        );
        if (!prostava.is_request && prostava.prostava_data.date.getTime() > Date.now()) {
            prostava.is_preview = true;
            prostava.closing_date = DateUtils.getDateDaysAfter(1, prostava.prostava_data.date);
        } else {
            prostava.is_preview = false;
            prostava.closing_date = DateUtils.getNowDatePlusHours(settings.pending_hours);
        }
    }
    static publishProstava(prostava: Prostava, settings: Group["settings"]): void {
        prostava.closing_date = new Date();
        if (ProstavaUtils.canApprovePendingProstava(prostava)) {
            this.approveProstava(prostava, settings);
        } else {
            this.rejectProstava(prostava);
        }
    }
    static approveProstava(prostava: Prostava, settings: Group["settings"]): void {
        if (prostava.is_request) {
            this.withdrawProstava(prostava);
            prostava.is_request = false;
            prostava.creation_date = new Date();
            prostava.closing_date = DateUtils.getDateDaysAfter(settings.create_days_ago, prostava.creation_date);
        } else {
            prostava.status = ProstavaStatus.Approved;
        }
    }
    static rejectProstava(prostava: Prostava): void {
        prostava.status = ProstavaStatus.Rejected;
        prostava.rating = 0;
    }
    static withdrawProstava(prostava: Prostava): void {
        prostava.status = ProstavaStatus.New;
        prostava.participants = [];
        prostava.rating = 0;
        prostava.is_preview = false;
        prostava.closing_date = new Date();
        prostava.participants_max_count = 0;
        prostava.participants_min_count = 0;
    }
    static updateParticipantRating(prostava: Prostava, user: User, rating: number): void {
        let participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user.user_id);
        if (!participant) {
            prostava.participants.push({ user: user, rating: 0 });
            participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user.user_id);
        }
        if (participant) {
            participant.rating = rating;
            prostava.rating = ProstavaUtils.updateTotalRating(prostava.participants);
        }
    }
    static updateTotalRating(participants: Prostava["participants"]): number {
        const participantsWere = this.filterParticipantsWere(participants);
        if (!participantsWere?.length) {
            return 0;
        }
        return (
            participantsWere.reduce((ratingSum, participant) => ratingSum + participant.rating, 0) /
            participantsWere.length
        );
    }
    static isProstavaModified(prostava: Prostava): boolean {
        return (prostava as ProstavaDocument).isModified();
    }
    static isProstavaExists(prostava: Prostava): boolean {
        return prostava._id && !(prostava as ProstavaDocument).isNew;
    }
    static saveProstava(prostava: Prostava): Promise<ProstavaDocument> {
        return (prostava as ProstavaDocument).save();
    }

    static findParticipantByUserId(
        participants: Prostava["participants"],
        userId: number | undefined
    ): ProstavaParticipant | undefined {
        return participants?.find((participant) => (participant.user as User).user_id === userId);
    }
    static findProstavaById(prostavas: Group["prostavas"], prostavaId: Prostava["_id"] | string): Prostava | undefined {
        return (prostavas as Prostava[]).find((prostava) => prostava._id.equals(prostavaId));
    }
    static deleteProstavaById(
        prostavas: Group["prostavas"],
        deletedProstava: Prostava | Types.ObjectId
    ): (Prostava | Types.ObjectId)[] {
        return prostavas.filter(
            (prostava) => !(prostava as Prostava)._id.equals((deletedProstava as Prostava)._id)
        ) as (Prostava | Types.ObjectId)[];
    }
    static findUserPendingProstava(
        prostavas: Group["prostavas"],
        userId: number | undefined,
        withinRequests = false
    ): Prostava | undefined {
        return ProstavaUtils.filterUserProstavas(prostavas, userId, withinRequests).find((prostava) =>
            ProstavaUtils.isProstavaPending(prostava)
        );
    }

    static filterUsersPendingToRateProstava(users: Group["users"], prostava: Prostava): User[] {
        return UserUtils.filterRealUsersExceptUserId(users, (prostava.author as User)?.user_id).filter(
            (user) =>
                !prostava.participants.find(
                    (participant) => (user as User).user_id === (participant.user as User).user_id
                )
        );
    }
    static filterParticipantsWere(participants: Prostava["participants"]): ProstavaParticipant[] {
        return participants?.filter((participant) => participant.rating > 0);
    }
    static filterUserProstavas(
        prostavas: Group["prostavas"],
        userId: number | undefined,
        withinRequests = false
    ): Prostava[] {
        return this.filterProstavas(prostavas, withinRequests).filter((prostava) =>
            withinRequests
                ? this.isUserCreatorOfPrastava(prostava, userId)
                : this.isUserAuthorOfPrastava(prostava, userId)
        );
    }
    static filterParticipantProstavas(prostavas: Group["prostavas"], userId: number | undefined): Prostava[] {
        return this.filterProstavas(prostavas).filter((prostava) => this.isUserParticipantOfPrastava(prostava, userId));
    }
    static filterProstavasByQuery(prostavas: Group["prostavas"], query: string | undefined): Prostava[] {
        return this.filterApprovedProstavas(prostavas).filter((prostava) => this.matchProstavaByQuery(prostava, query));
    }
    static filterProstavasByDate(prostavas: Group["prostavas"], date: Date): Prostava[] {
        return (prostavas as Prostava[]).filter(
            (prostava) => prostava.prostava_data.date.toDateString() === date.toDateString()
        );
    }
    static filterProstavasByYear(prostavas: Group["prostavas"], year: number): Prostava[] {
        return (prostavas as Prostava[]).filter((prostava) => prostava.closing_date?.getFullYear() === year);
    }
    static filterScheduledProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return [
            ...this.filterApprovedProstavas(prostavas),
            ...this.filterRejectedProstavas(prostavas),
            ...this.filterPendingProstavas(prostavas)
        ];
    }
    static filterNewRequiredProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return this.filterNewProstavas(prostavas).filter((prostava) => this.isProstavaRequired(prostava));
    }
    static filterApprovedProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaApproved(prostava));
    }
    static filterRejectedProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaRejected(prostava));
    }
    static filterNewProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaNew(prostava));
    }
    static filterPendingProstavas(prostavas: Group["prostavas"]): Prostava[] {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaPending(prostava));
    }
    static filterUserNewProstavas(
        prostavas: Group["prostavas"],
        userId: number | undefined,
        withinRequests = false
    ): Prostava[] {
        return ProstavaUtils.filterUserProstavas(prostavas, userId, withinRequests).filter((prostava) =>
            ProstavaUtils.isProstavaNew(prostava)
        );
    }
    static filterProstavas(prostavas: Group["prostavas"], withinRequests = false): Prostava[] {
        return (prostavas as Prostava[]).filter((prostava) =>
            withinRequests ? this.isRequest(prostava) : !this.isRequest(prostava)
        );
    }
    static matchProstavaByQuery(prostava: Prostava, query: string | undefined): boolean {
        if (!query || prostava.prostava_data.title?.match(query)) {
            return true;
        }
        return false;
    }

    static getProstavaRatingString(rating: Prostava["rating"], ratingString: Prostava["rating_string"]): string {
        const missCode = Object.values(CODE.RATING)[0];
        return (
            Object.entries(CODE.RATING)
                .slice(1)
                .reduce(
                    (ratingString, ratingCode) =>
                        ratingString + (Number(ratingCode[0]) <= Math.round(rating) ? ratingCode[1] : missCode),
                    ""
                ) +
            " " +
            ratingString
        );
    }
    static getParticipantsString(
        participants: Prostava["participants"],
        minCount: Prostava["participants_min_count"],
        withRating = true
    ): string {
        const participantsWere = this.filterParticipantsWere(participants);
        let participantsString = participantsWere?.reduce(
            (participantsString, participant) =>
                participantsString +
                (participant.user as User).personal_data.emoji +
                (withRating ? participant.rating : ""),
            ""
        );
        if (!minCount) {
            return participantsString;
        }
        if (!participantsWere?.length || participantsWere.length < minCount) {
            for (let i = 0; i < minCount - (participantsWere?.length || 0); i++) {
                participantsString = participantsString + CODE.COMMAND.PROFILE + (withRating ? "0" : "");
            }
        }
        return participantsString;
    }
    static getParticipantsVotesString(
        participantsCount: Prostava["participants_string"],
        participantsMaxCount: number
    ): string {
        return participantsCount + "/" + participantsMaxCount.toString();
    }
    static getVenueDisplayString(venue: Venue | undefined): string {
        return (
            ConverterUtils.displayValue(venue?.location ? CODE.ACTION.PROSTAVA_LOCATION : "") +
            ConverterUtils.displayValue(venue?.title)
        );
    }
    static getProstavaTypesString(types: ProstavaType[]): string {
        return types.reduce((typesString, type) => typesString + type.emoji, "");
    }
    static getProstavaCommand(prostava: Prostava): string {
        return prostava.is_request ? PROSTAVA.COMMAND.REQUEST : PROSTAVA.COMMAND.PROSTAVA;
    }
    static getProstavaWithdrawCommand(prostava: Prostava): string {
        return prostava.is_request ? PROSTAVA.COMMAND.REQUEST_UNDO : PROSTAVA.COMMAND.PROSTAVA_UNDO;
    }
    static getProstavaCompleteCommand(prostava: Prostava): string {
        return prostava.is_request
            ? PROSTAVA.COMMAND.REQUEST_SAVE
            : prostava.is_preview
            ? PROSTAVA.COMMAND.PROSTAVA_UNDO
            : PROSTAVA.COMMAND.PROSTAVA_SAVE;
    }
    static getMinDateOfProstavas(prostavas: Prostava[] | undefined): Date {
        if (!prostavas?.length) {
            return new Date();
        }
        return prostavas.reduce(
            (min, prostava) =>
                min.getTime() > prostava.prostava_data.date.getTime() ? prostava.prostava_data.date : min,
            new Date()
        );
    }
    static getMaxDateOfProstavas(prostavas: Prostava[] | undefined): Date {
        if (!prostavas?.length) {
            return new Date();
        }
        return prostavas.reduce(
            (max, prostava) =>
                max.getTime() < prostava.prostava_data.date.getTime() ? prostava.prostava_data.date : max,
            new Date()
        );
    }
    static getProstavasDateTexts(
        prostavas: Prostava[] | undefined,
        users: Group["users"]
    ): Map<string, string> | undefined {
        if (!prostavas?.length) {
            return undefined;
        }
        const dateTexts = new Map();
        prostavas.forEach((prostava) => {
            const day = DateUtils.toYyyymmdd(prostava.prostava_data.date);
            if (dateTexts.has(day)) {
                dateTexts.set(day, CODE.ACTION.PROSTAVA_RATING);
            } else {
                dateTexts.set(day, prostava.prostava_data.type);
            }
        });
        for (const user of users as User[]) {
            if (!user.personal_data.birthday) {
                continue;
            }
            const dates = DateUtils.repeatDateYearlyFromTo(
                user.personal_data.birthday,
                DateUtils.getFirstDayOfYear(this.getMinDateOfProstavas(prostavas)),
                DateUtils.getLastDayOfYear(this.getMaxDateOfProstavas(prostavas))
            );
            for (const date of dates) {
                const day = DateUtils.toYyyymmdd(date);
                if (dateTexts.has(day)) {
                    continue;
                }
                dateTexts.set(day, CODE.ACTION.PROFILE_BIRTHDAY);
            }
        }
        return dateTexts;
    }

    static isUserParticipantOfPrastava(prostava: Prostava, userId: number | undefined): boolean {
        return (
            this.isUserAuthorOfPrastava(prostava, userId) ||
            this.filterParticipantsWere(prostava.participants).some(
                (participant) => (participant.user as User).user_id === userId
            )
        );
    }
    static isUserAuthorOfPrastava(prostava: Prostava, userId: number | undefined): boolean {
        return (prostava.author as User)?.user_id === userId;
    }
    static isUserCreatorOfPrastava(prostava: Prostava, userId: number | undefined): boolean {
        return (prostava.creator as User)?.user_id === userId;
    }

    static canCompletePendingProstava(prostava: Prostava): boolean {
        if (prostava?.participants?.length === prostava?.participants_max_count) {
            return true;
        }
        if (this.isProstavaExpired(prostava)) {
            return true;
        }
        return false;
    }
    static canApprovePendingProstava(prostava: Prostava): boolean {
        if (!prostava.participants_min_count) {
            return true;
        }
        if (this.filterParticipantsWere(prostava.participants)?.length >= prostava.participants_min_count) {
            return true;
        }
        return false;
    }

    static canAnnounceProstava(prostava: Prostava | undefined): boolean {
        if (!prostava || !this.isProstavaNew(prostava)) {
            return false;
        }
        const error = (prostava as ProstavaDocument).validateSync() as Error.ValidationError;
        if (!error) {
            return true;
        }
        if (prostava.is_request) {
            return !error.errors["author"] && !error.errors["type"] && !error.errors["prostava_data.title"]
                ? true
                : false;
        }
        if (prostava.prostava_data.date.getTime() > Date.now()) {
            return !error.errors["prostava_data.title"] &&
                !error.errors["prostava_data.date"] &&
                !error.errors["prostava_data.venue.title"] &&
                !error.errors["prostava_data.venue.location"]
                ? true
                : false;
        }
        return false;
    }
    static canWithdrawProstava(prostava: Prostava | undefined): boolean {
        if (!prostava || !this.isProstavaPending(prostava)) {
            return false;
        }
        return true;
    }
    static isRequest(prostava: Prostava | undefined): boolean {
        return prostava && prostava.is_request ? true : false;
    }
    static isPreview(prostava: Prostava | undefined): boolean {
        return prostava && prostava.is_preview ? true : false;
    }
    static isProstavaApproved(prostava: Prostava | undefined): boolean {
        return prostava?.status === ProstavaStatus.Approved;
    }
    static isProstavaRejected(prostava: Prostava | undefined): boolean {
        return prostava?.status === ProstavaStatus.Rejected;
    }
    static isProstavaPending(prostava: Prostava | undefined): boolean {
        return prostava?.status === ProstavaStatus.Pending;
    }
    static isProstavaNew(prostava: Prostava | undefined): boolean {
        return prostava?.status === ProstavaStatus.New;
    }
    static isProstavaRequired(prostava: Prostava): boolean {
        return (prostava.author as User).user_id !== (prostava.creator as User).user_id;
    }
    static isProstavaExpired(prostava: Prostava): boolean {
        return !prostava.closing_date || prostava.closing_date.getTime() <= Date.now() ? true : false;
    }

    static getPendingCompletedProstavasFromDB(): Promise<ProstavaDocument[]> {
        return ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$status", ProstavaStatus.Pending] },
                    {
                        $or: [
                            { $lte: ["$closing_date", new Date()] },
                            {
                                $and: [
                                    { $eq: [{ $size: "$participants" }, "$participants_max_count"] },
                                    { $ne: ["$is_preview", true] }
                                ]
                            }
                        ]
                    }
                ]
            }
        })
            .populate("author")
            .populate("creator")
            .exec();
    }
    static getPendingUncompletedProstavasFromDB(): Promise<ProstavaDocument[]> {
        return ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$status", ProstavaStatus.Pending] },
                    { $lt: [{ $size: "$participants" }, "$participants_max_count"] }
                ]
            }
        })
            .populate("author")
            .populate("creator")
            .exec();
    }
    static getExpiredProstavasFromDB(): Promise<ProstavaDocument[]> {
        return ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$is_request", false] },
                    { $eq: ["$status", ProstavaStatus.New] },
                    { $lte: ["$closing_date", new Date()] },
                    { $ne: ["$author", "$creator"] }
                ]
            }
        }).exec();
    }
}
