import { Types, Error } from "mongoose";
import { Venue } from "telegraf/typings/core/types/typegram";
import { CODE, PROSTAVA } from "../constants";
import { Group, Prostava, ProstavaDocument, ProstavaStatus, ProstavaType, User } from "../types";
import { DateUtils } from "./date";
import { RegexUtils } from "./regex";
import { ConverterUtils } from "./converter";
import { ProstavaCollection } from "../models";
import { UserUtils } from "./user";
import { GroupUtils } from "./group";

export class ProstavaUtils {
    static createProstavaFromText(group: Group, user: User, text: string, isRequest = false) {
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
            _id: Types.ObjectId(),
            group_id: group._id,
            author: author,
            creator: user,
            creation_date: new Date(),
            is_request: isRequest,
            prostava_data: {
                type: prostavaType,
                title:
                    prostavaData[0] && RegexUtils.matchTitle().test(prostavaData[0]) ? prostavaData[0] : prostavaTitle,
                date: this.fillProstavaDateFromText(prostavaData[1], group.settings),
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
    static fillProstavaCostFromText(costText: string, currency?: string) {
        const cost = costText?.split(/(?=\p{Sc})/u) || [];
        return {
            amount: Number(cost[0]),
            currency: cost[1] || currency
        };
    }
    static fillProstavaDateFromText(dateText: string, settings: Group["settings"]) {
        const dateNow = new Date(Date.now());
        if (!dateText || !RegexUtils.matchDate().test(dateText)) {
            return dateNow;
        }
        const dateIn = new Date(dateText);
        const dateAgo = DateUtils.getDateDaysAgo(settings.create_days_ago);
        if ((dateAgo && dateIn.getTime() < dateAgo.getTime()) || dateIn.getTime() > dateNow.getTime()) {
            return dateNow;
        }
        return dateIn;
    }
    static fillFakeProstavaFromUser(user: User) {
        return new ProstavaCollection({ status: "", author: user, prostava_data: {} });
    }
    static getProstavaId(prostava: Prostava) {
        return (prostava as ProstavaDocument).id;
    }

    static announceProstava(prostava: Prostava, settings: Group["settings"]) {
        prostava.status = ProstavaStatus.Pending;
        prostava.participants_max_count = settings.chat_members_count - 1;
        prostava.participants_min_count = Math.ceil(
            (prostava.participants_max_count * settings.participants_min_percent) / 100
        );
        prostava.closing_date = DateUtils.getNowDatePlusHours(settings.pending_hours);
    }
    static publishProstava(prostava: Prostava) {
        if (ProstavaUtils.canApprovePendingProstava(prostava)) {
            this.approveProstava(prostava);
        } else {
            this.rejectProstava(prostava);
        }
        prostava.closing_date = new Date();
    }
    static approveProstava(prostava: Prostava) {
        if (prostava.is_request) {
            this.withdrawProstava(prostava);
            prostava.is_request = false;
            prostava.creation_date = new Date();
        } else {
            prostava.status = ProstavaStatus.Approved;
        }
    }
    static rejectProstava(prostava: Prostava) {
        prostava.status = ProstavaStatus.Rejected;
    }
    static withdrawProstava(prostava: Prostava) {
        prostava.status = ProstavaStatus.New;
        prostava.participants = [];
        prostava.rating = 0;
        prostava.closing_date = new Date();
        prostava.participants_max_count = 0;
        prostava.participants_min_count = 0;
    }
    static updateParticipantRating(prostava: Prostava, user: User, rating: number) {
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
    static updateTotalRating(participants: Prostava["participants"]) {
        const participantsWere = this.filterParticipantsWere(participants);
        if (!participantsWere?.length) {
            return 0;
        }
        return (
            participantsWere.reduce((ratingSum, participant) => ratingSum + participant.rating, 0) /
            participantsWere.length
        );
    }
    static isProstavaModified(prostava: Prostava) {
        return (prostava as ProstavaDocument).isModified();
    }
    static saveProstava(prostava: Prostava) {
        return (prostava as ProstavaDocument).save();
    }

    static findParticipantByUserId(participants: Prostava["participants"], userId: number | undefined) {
        return participants?.find((participant) => (participant.user as User).user_id === userId);
    }
    static findProstavaById(prostavas: Group["prostavas"], prostavaId: Prostava["_id"] | string | undefined) {
        return (prostavas as Prostava[]).find((prostava) => prostava._id.equals(prostavaId!));
    }
    static deleteProstavaById(prostavas: Group["prostavas"], deletedProstava: Prostava | Types.ObjectId) {
        return prostavas.filter(
            (prostava) => !(prostava as Prostava)._id.equals((deletedProstava as Prostava)._id)
        ) as (Prostava | Types.ObjectId)[];
    }
    static findUserPendingProstava(prostavas: Group["prostavas"], userId: number | undefined, withinRequests = false) {
        return ProstavaUtils.filterUserProstavas(prostavas, userId, withinRequests).find((prostava) =>
            ProstavaUtils.isProstavaPending(prostava)
        );
    }

    static filterUsersPendingToRateProstava(users: Group["users"], prostava: Prostava) {
        return UserUtils.filterRealUsersExceptUserId(users, (prostava.author as User)?.user_id).filter(
            (user) =>
                !prostava.participants.find(
                    (participant) => (user as User).user_id === (participant.user as User).user_id
                )
        );
    }
    static filterParticipantsWere(participants: Prostava["participants"]) {
        return participants?.filter((participant) => participant.rating > 0);
    }
    static filterUserProstavas(prostavas: Group["prostavas"], userId: number | undefined, withinRequests = false) {
        return this.filterProstavas(prostavas, withinRequests).filter((prostava) =>
            withinRequests
                ? this.isUserCreatorOfPrastava(prostava, userId)
                : this.isUserAuthorOfPrastava(prostava, userId)
        );
    }
    static filterProstavasByQuery(prostavas: Group["prostavas"], query: string | undefined) {
        return this.filterApprovedProstavas(prostavas).filter((prostava) => this.matchProstavaByQuery(prostava, query));
    }
    static filterProstavasByDate(prostavas: Group["prostavas"], date: Date) {
        return (prostavas as Prostava[]).filter(
            (prostava) => prostava.prostava_data.date.toDateString() === date.toDateString()
        );
    }
    static filterApprovedProstavas(prostavas: Group["prostavas"]) {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaApproved(prostava));
    }
    static filterScheduledNewProstavas(prostavas: Group["prostavas"]) {
        return this.filterNewProstavas(prostavas).filter(
            (prostava) => prostava.prostava_data.date && prostava.prostava_data.date.getTime() > new Date().getTime()
        );
    }
    static filterNewProstavas(prostavas: Group["prostavas"]) {
        return this.filterProstavas(prostavas).filter((prostava) => this.isProstavaNew(prostava));
    }
    static filterUserNewProstavas(prostavas: Group["prostavas"], userId: number | undefined, withinRequests = false) {
        return ProstavaUtils.filterUserProstavas(prostavas, userId, withinRequests).filter((prostava) =>
            ProstavaUtils.isProstavaNew(prostava)
        );
    }
    static filterProstavas(prostavas: Group["prostavas"], withinRequests = false) {
        return (prostavas as Prostava[]).filter((prostava) =>
            withinRequests ? this.isRequest(prostava) : !this.isRequest(prostava)
        );
    }
    static matchProstavaByQuery(prostava: Prostava, query: string | undefined) {
        if (!query || prostava.prostava_data.title?.match(query)) {
            return true;
        }
        return false;
    }

    static getProstavaRatingString(rating: Prostava["rating"], ratingString: Prostava["rating_string"]) {
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
    ) {
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
    ) {
        return participantsCount + "/" + participantsMaxCount.toString();
    }
    static getVenueDisplayString(venue: Venue | undefined) {
        return (
            ConverterUtils.displayValue(venue?.location ? CODE.ACTION.PROSTAVA_LOCATION : "") +
            ConverterUtils.displayValue(venue?.title)
        );
    }
    static getProstavaTypesString(types: ProstavaType[]) {
        return types.reduce((typesString, type) => typesString + type.emoji, "");
    }
    static getProstavaCommand(prostava: Prostava) {
        return prostava.is_request ? PROSTAVA.COMMAND.REQUEST : PROSTAVA.COMMAND.PROSTAVA;
    }
    static getMinDateOfProstavas(prostavas: Prostava[] | undefined) {
        if (!prostavas?.length) {
            return new Date();
        }
        return prostavas.reduce(
            (min, prostava) =>
                min.getTime() > prostava.prostava_data.date.getTime() ? prostava.prostava_data.date : min,
            new Date()
        );
    }
    static getMaxDateOfProstavas(prostavas: Prostava[] | undefined) {
        if (!prostavas?.length) {
            return new Date();
        }
        return prostavas.reduce(
            (max, prostava) =>
                max.getTime() < prostava.prostava_data.date.getTime() ? prostava.prostava_data.date : max,
            new Date()
        );
    }
    static getProstavasDateTexts(prostavas: Prostava[] | undefined, users: Group["users"]) {
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

    static isUserAuthorOfPrastava(prostava: Prostava, userId: number | undefined) {
        return (prostava.author as User)?.user_id === userId;
    }
    static isUserCreatorOfPrastava(prostava: Prostava, userId: number | undefined) {
        return (prostava.creator as User)?.user_id === userId;
    }

    static canCompletePendingProstava(prostava: Prostava) {
        if (prostava?.participants?.length === prostava?.participants_max_count) {
            return true;
        }
        if (!prostava?.closing_date || prostava?.closing_date.getTime() <= Date.now()) {
            return true;
        }
        return false;
    }
    static canApprovePendingProstava(prostava: Prostava) {
        if (!prostava.participants_min_count) {
            return true;
        }
        if (this.filterParticipantsWere(prostava.participants)?.length >= prostava.participants_min_count) {
            return true;
        }
        return false;
    }

    static canAnnounceProstava(prostava: Prostava | undefined) {
        if (!prostava) {
            return false;
        }
        const error = (prostava as ProstavaDocument).validateSync() as Error.ValidationError;
        if (!error) {
            return prostava.prostava_data.date.getTime() <= new Date().getTime();
        }
        if (prostava.is_request) {
            return !error.errors["author"] && !error.errors["type"] && !error.errors["prostava_data.title"]
                ? true
                : false;
        }
        return false;
    }
    static isRequest(prostava: Prostava | undefined) {
        return prostava?.is_request;
    }
    static isProstavaApproved(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.Approved;
    }
    static isProstavaPending(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.Pending;
    }
    static isProstavaNew(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.New;
    }

    static getPendingCompletedProstavasFromDB() {
        return ProstavaCollection.find({
            $expr: {
                $and: [
                    { $eq: ["$status", ProstavaStatus.Pending] },
                    {
                        $or: [
                            { $lte: ["$closing_date", new Date()] },
                            { $eq: [{ $size: "$participants" }, "$participants_max_count"] }
                        ]
                    }
                ]
            }
        })
            .populate("author")
            .populate("creator")
            .exec();
    }
    static getPendingUncompletedProstavasFromDB() {
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
}
