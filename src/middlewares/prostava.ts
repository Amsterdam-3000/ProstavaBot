import { CODE, PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ProstavaUtils, TelegramUtils, UserUtils } from "../utils";

export class ProstavaMiddleware {
    static async addPendingProstavaToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const user = TelegramUtils.getUserFromContext(ctx);
        const isRequest = TelegramUtils.includesCommand(ctx, PROSTAVA.COMMAND.REQUEST);
        ctx.prostava = ProstavaUtils.findUserPendingProstava(ctx.group.prostavas, user?.id, isRequest);
        await next();
    }
    static async addNewProstavaToContext(ctx: UpdateContext, next: () => Promise<void>) {
        if (TelegramUtils.getProstavaFromContext(ctx)) {
            delete ctx.prostavas;
        } else {
            const user = TelegramUtils.getUserFromContext(ctx);
            const isRequest = TelegramUtils.includesCommand(ctx, PROSTAVA.COMMAND.REQUEST);
            ctx.prostavas = ProstavaUtils.filterUserNewProstavas(ctx.group.prostavas, user?.id, isRequest);
        }
        if (ctx.prostavas?.length === 1) {
            ctx.prostava = ctx.prostavas[0];
            delete ctx.prostavas;
        } else if (ctx.prostavas?.length) {
            const prostavaId = TelegramUtils.getSceneState(ctx).prostavaId;
            ctx.prostava = ProstavaUtils.findProstavaById(ctx.prostavas, prostavaId);
        } else if (!ctx.prostava && TelegramUtils.isMessageProstavaCommand(ctx)) {
            const commandText = TelegramUtils.getMessageCommandText(ctx);
            const isRequest = TelegramUtils.includesCommand(ctx, PROSTAVA.COMMAND.REQUEST);
            ctx.prostava = ProstavaUtils.createProstavaFromText(ctx.group, ctx.user, commandText, isRequest);
            ctx.group.prostavas.push(ctx.prostava);
        }
        await next();
    }
    static async addProstavaFromRateActionToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const prostavaId = TelegramUtils.getActionDataFromCbQuery(ctx)?.id;
        if (!prostavaId) {
            await ctx.answerCbQuery();
            return;
        }
        ctx.prostava = ProstavaUtils.findProstavaById(ctx.group.prostavas, prostavaId);
        await next();
    }
    static async addProstavaFromSelectActionToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const prostavaId = TelegramUtils.getActionDataFromCbQuery(ctx)?.value;
        if (!prostavaId || !ctx.prostavas?.length) {
            await ctx.answerCbQuery();
            return;
        }
        ctx.prostava = ProstavaUtils.findProstavaById(ctx.prostavas, prostavaId);
        TelegramUtils.setSceneState(ctx, { prostavaId: prostavaId });
        await next();
    }

    static async addAllNewProstavasToContext(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.prostavas = ProstavaUtils.filterNewProstavas(ctx.group.prostavas);
        await next();
    }
    static async addDateProstavasToContext(ctx: UpdateContext, next: () => Promise<void>) {
        let date = new Date();
        if (TelegramUtils.getCbQueryData(ctx)) {
            date = new Date(TelegramUtils.getDateTextFromCalendarAction(ctx));
        }
        const birthdayUsers = UserUtils.filterRealUsersByBirthday(ctx.group.users, date);
        ctx.prostavas = [];
        for (const user of birthdayUsers) {
            const prostava = ProstavaUtils.fillFakeProstavaFromUser(user);
            prostava.prostava_data.type = CODE.ACTION.PROFILE_BIRTHDAY;
            prostava.prostava_data.title = LocaleUtils.getActionText(
                ctx.i18n,
                PROSTAVA.ACTION.PROFILE_BIRTHDAY,
                UserUtils.getUserAgeByDate(user, date).toString()
            );
            ctx.prostavas.push(prostava);
        }
        ctx.prostavas = [
            ...ctx.prostavas,
            ...ProstavaUtils.filterProstavasByDate(ProstavaUtils.filterScheduledProstavas(ctx.group.prostavas), date)
        ];
        await next();
    }
    static async addQueryProstavasToContext(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.prostavas = ProstavaUtils.filterProstavasByQuery(ctx.group.prostavas, ctx.inlineQuery?.query);
        await next();
    }

    static async changeProstavaAuthor(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const user = UserUtils.findUserByUserId(ctx.group.users, Number(actionData?.value));
        if (prostava && user) {
            prostava.author = user;
        }
        await next();
    }
    static async changeProstavaType(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        if (prostava && actionData?.value) {
            prostava.prostava_data.type = actionData?.value;
        }
        await next();
    }
    static async changeProstavaOrVenueTitle(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            switch (TelegramUtils.getActionDataFromSceneState(ctx)?.action) {
                case PROSTAVA.ACTION.PROSTAVA_TITLE:
                    prostava.prostava_data.title = TelegramUtils.getTextMessage(ctx).text;
                    break;
                case PROSTAVA.ACTION.PROSTAVA_VENUE:
                    prostava.prostava_data.venue.title = TelegramUtils.getTextMessage(ctx).text;
                    break;
            }
        }
        await next();
    }
    static async changeProstavaDate(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            ProstavaUtils.changeProstavaDate(prostava, TelegramUtils.getDateTextFromCalendarAction(ctx));
        }
        await next();
    }
    static async changeProstavaTime(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            ProstavaUtils.changeProstavaTime(prostava, TelegramUtils.getTextMessage(ctx).text);
        }
        await next();
    }
    static async changeProstavaVenue(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.venue = TelegramUtils.getVenueMessage(ctx).venue;
        }
        await next();
    }
    static async changeProstavaLocation(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.venue.location = TelegramUtils.getLocationMessage(ctx).location;
        }
        await next();
    }
    static async changeProstavaCost(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.cost = ProstavaUtils.fillProstavaCostFromText(
                TelegramUtils.getTextMessage(ctx).text,
                ctx.group.settings.currency
            );
        }
        await next();
    }

    static async canAnnounceProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!ProstavaUtils.canAnnounceProstava(prostava)) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_CREATE));
            return;
        }
        await next();
    }
    static async isUserParticipantOfProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        if (!prostava) {
            ctx.answerCbQuery();
            return;
        }
        if (ProstavaUtils.isUserAuthorOfPrastava(prostava, user?.id)) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_RATE));
            return;
        }
        await next();
    }
    static async isProstavaPendingCompleted(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava || !ProstavaUtils.canCompletePendingProstava(prostava)) {
            return;
        }
        await next();
    }
    static async hasUserPendingProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava || !ProstavaUtils.isProstavaPending(prostava)) {
            return;
        }
        await next();
    }
    static async hasProstavaUsersPendingToRate(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava || !ProstavaUtils.filterUsersPendingToRateProstava(ctx.group.users, prostava)?.length) {
            return;
        }
        await next();
    }
    static async isUserCreatorOfProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava || !ProstavaUtils.isUserCreatorOfPrastava(prostava, ctx.user.user_id)) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_CHANGE));
            return;
        }
        await next();
    }

    static async announceProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            ProstavaUtils.announceProstava(prostava, ctx.group.settings);
        }
        await next();
    }
    static async withdrawProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            ProstavaUtils.withdrawProstava(prostava);
        }
        await next();
    }
    static async changeProstavaParticipantRating(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            ctx.answerCbQuery();
            return;
        }
        const rating = Number(TelegramUtils.getActionDataFromCbQuery(ctx)?.value);
        const participant = ProstavaUtils.findParticipantByUserId(prostava.participants, ctx.user.user_id);
        if (participant?.rating === rating) {
            ctx.answerCbQuery();
            return;
        }
        ProstavaUtils.updateParticipantRating(prostava, ctx.user, rating);
        await next();
    }
    static async publishProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = TelegramUtils.getProstavaFromContext(ctx);
        if (prostava) {
            ProstavaUtils.publishProstava(prostava);
        }
        await next();
    }

    static async saveProstava(ctx: UpdateContext, next: () => Promise<void>) {
        let prostava = TelegramUtils.getProstavaFromContext(ctx);
        await next();
        prostava = TelegramUtils.getProstavaFromContext(ctx) || prostava;
        if (!prostava || !ProstavaUtils.isProstavaModified(prostava)) {
            return;
        }
        await ProstavaUtils.saveProstava(prostava).catch((err) => console.log(err));
    }
}
