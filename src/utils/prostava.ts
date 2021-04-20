import { Types } from "mongoose";
import { ProstavaCollection } from "../models";
import { Venue } from "telegraf/typings/core/types/typegram";
import { CODE } from "../constants";
import { Group, GroupSettings, Prostava, ProstavaDocument, ProstavaStatus, UpdateContext, User } from "../types";
import { DateUtils } from "./date";
import { RegexUtils } from "./regex";
import { StringUtils } from "./string";
import { TelegramUtils } from "./telegram";

export class ProstavaUtils {
    static getProstavaFromContext(ctx: UpdateContext) {
        if (ctx.prostava) {
            return ctx.prostava;
        }
        if (!ctx.session?.prostava) {
            return undefined;
        }
        if (!(ctx.session.prostava as ProstavaDocument).id) {
            ctx.session.prostava = new ProstavaCollection(ctx.session.prostava);
        }
        return ctx.session.prostava;
    }

    static fillNewUser(ctx: UpdateContext) {
        const chat = TelegramUtils.getChatFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        return {
            _id: Types.ObjectId(),
            user_id: user?.id,
            group_id: chat?.id,
            personal_data: {
                name: TelegramUtils.getUserString(user)
            }
        };
    }
    static fillProstavaFromText(ctx: UpdateContext) {
        const chat = TelegramUtils.getChatFromContext(ctx);
        const commandText = TelegramUtils.getCommandText(ctx);
        const prostavaData = commandText?.split("|") || [];
        return {
            _id: Types.ObjectId(),
            group_id: chat?.id,
            author: ctx.user,
            prostava_data: {
                title: RegexUtils.matchTitle().test(prostavaData[0]) ? prostavaData[0] : "",
                date: this.fillProstavaDateFromText(prostavaData[1], ctx.group.settings),
                venue: {
                    title: RegexUtils.matchTitle().test(prostavaData[2]) ? prostavaData[0] : ""
                },
                cost: this.fillProstavaCostFromText(prostavaData[3], ctx.group.settings.currency)
            }
        };
    }
    static fillProstavaCostFromText(costText: string, currency?: string) {
        const cost = costText?.split(/(?=\p{Sc})/u) || [];
        return {
            amount: Number(cost[0]),
            currency: cost[1] || currency
        };
    }
    static fillProstavaDateFromText(dateText: string, settings: GroupSettings) {
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
    static fillProstavaFromDeleted(prostava: Prostava) {
        return {
            group_id: prostava.group_id,
            author: prostava.author,
            prostava_data: prostava.prostava_data
        };
    }

    static updateTotalRating(participants: Prostava["participants"]) {
        const participantsWere = this.filterParticipantsWere(participants);
        if (!participantsWere) {
            return 0;
        }
        return (
            participantsWere.reduce((ratingSum, participant) => ratingSum + participant.rating, 0) /
            participantsWere.length
        );
    }

    static populateGroupProstavas(group: Group) {
        //TODO Autopopulate via mongo mb???
        (group.prostavas as [Prostava]).forEach(async (prostava) => {
            prostava.author = ProstavaUtils.findUserById(group.users, prostava.author) || prostava.author;
            prostava.participants?.forEach((participant) => {
                participant.user = ProstavaUtils.findUserById(group.users, participant.user) || participant.user;
            });
        });
    }
    static findUserById(users: Group["users"], userId: Prostava["author"]) {
        return (users as [User]).find((user) => user._id.equals(userId as Types.ObjectId));
    }
    static findUserByUserId(users: Group["users"], userId: number | undefined) {
        return (users as [User]).find((user) => user.user_id === userId);
    }
    static findParticipantByUserId(participants: Prostava["participants"], userId: number | undefined) {
        return participants?.find((participant) => (participant.user as User).user_id === userId);
    }
    static deleteProstavaById(prostavas: Group["prostavas"], deletedProstava: Prostava | Types.ObjectId) {
        return prostavas.filter(
            (prostava) => !(prostava as Prostava)._id.equals((deletedProstava as Prostava)._id)
        ) as [Prostava | Types.ObjectId];
    }

    static getRatingString(rating: Prostava["rating"], ratingString: Prostava["rating_string"]) {
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
    static getParticipantsString(participants: Prostava["participants"], minCount: Prostava["participants_min_count"]) {
        const participantsWere = this.filterParticipantsWere(participants);
        let participantsString = participantsWere?.reduce(
            (participantsString, participant) =>
                participantsString + (participant.user as User).personal_data.emoji + participant.rating,
            ""
        );
        if (!minCount) {
            return participantsString;
        }
        if (!participantsWere?.length || participantsWere.length < minCount) {
            for (let i = 0; i < minCount - (participantsWere?.length || 0); i++) {
                participantsString = participantsString + CODE.COMMAND.PROFILE + "0";
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
            StringUtils.displayValue(venue?.location ? CODE.ACTION.PROSTAVA_LOCATION : "") +
            StringUtils.displayValue(venue?.title)
        );
    }

    static filterParticipantsWere(participants: Prostava["participants"]) {
        return participants?.filter((participant) => participant.rating > 0);
    }
    static filterUserProstavas(prostavas: Group["prostavas"], userId: number | undefined) {
        return (prostavas as [Prostava]).filter((prostava) => this.isUserAuthorOfPrastava(prostava, userId));
    }
    static filterProstavasByQuery(prostavas: Group["prostavas"], query: string | undefined) {
        return this.filterCompletedProstavas(prostavas).filter((prostava) =>
            this.matchProstavaByQuery(prostava, query)
        );
    }
    static filterCompletedProstavas(prostavas: Group["prostavas"]) {
        return (prostavas as [Prostava]).filter((prostava) => this.isProstavaCompleted(prostava));
    }
    static matchProstavaByQuery(prostava: Prostava, query: string | undefined) {
        if (!query || prostava.prostava_data.title?.match(query)) {
            return true;
        }
        return false;
    }
    static isUserAuthorOfPrastava(prostava: Prostava, userId: number | undefined) {
        return (prostava.author as User).user_id === userId;
    }
    static isProstavaPendingCompleted(prostava: Prostava) {
        if (prostava?.participants?.length === prostava?.participants_max_count) {
            return true;
        }
        if (!prostava?.closing_date || prostava?.closing_date.getTime() <= Date.now()) {
            return true;
        }
        return false;
    }
    static isProstavaCompleted(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.Approved || prostava?.status === ProstavaStatus.Rejected;
    }
    static isProstavaPending(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.Pending;
    }
    static isProstavaNew(prostava: Prostava | undefined) {
        return prostava?.status === ProstavaStatus.New;
    }
}
