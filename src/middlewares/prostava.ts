import { CODE, PROSTAVA } from "../constants";
import { ProstavaCollection } from "../models";
import { Prostava, ProstavaDocument, ProstavaStatus, UpdateContext } from "../types";
import { DateUtils, LocaleUtils, ObjectUtils, ProstavaUtils, StringUtils, TelegramUtils } from "../utils";

export class ProstavaMiddleware {
    static async addPendingProstavaToContext(ctx: UpdateContext, next: Function) {
        if (!ProstavaUtils.getProstavaFromContext(ctx)) {
            const user = TelegramUtils.getUserFromContext(ctx);
            ctx.prostava = ProstavaUtils.filterUserProstavas(ctx.group.prostavas, user.id).find((prostava) =>
                ProstavaUtils.isProstavaPending(prostava)
            );
        }
        await next();
    }
    static async addProstavaFromActionToContext(ctx: UpdateContext, next: Function) {
        const actionData = ObjectUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        ctx.prostava = (ctx.group.prostavas as [Prostava]).find(
            (prostava) => (prostava as ProstavaDocument).id === actionData.id
        );
        await next();
    }
    static async addNewProstavaToSession(ctx: UpdateContext, next: Function) {
        if (!ProstavaUtils.getProstavaFromContext(ctx)) {
            ctx.session.prostava = new ProstavaCollection(ProstavaUtils.fillProstavaFromText(ctx));
        }
        await next();
    }
    static async deleteProstavaFromContext(ctx: UpdateContext, next: Function) {
        delete ctx.prostava;
        if (ctx.session?.prostava) {
            delete ctx.session.prostava;
        }
        await next();
    }

    static async changeProstavaOrVenueTitle(ctx: UpdateContext, next: Function) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        switch (ObjectUtils.parseActionData(sceneState.actionData)?.action) {
            case PROSTAVA.ACTION.PROSTAVA_TITLE:
                prostava.prostava_data.title = TelegramUtils.getTextMessage(ctx).text;
                break;
            case PROSTAVA.ACTION.PROSTAVA_VENUE:
                prostava.prostava_data.venue.title = TelegramUtils.getTextMessage(ctx).text;
                break;
        }
        await next();
    }
    static async changeProstavaDate(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        prostava.prostava_data.date = new Date(StringUtils.sliceCalendarActionDate(TelegramUtils.getCbQueryData(ctx)));
        await next();
    }
    static async changeProstavaVenue(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        prostava.prostava_data.venue = TelegramUtils.getVenueMessage(ctx).venue;
        await next();
    }
    static async changeProstavaLocation(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        prostava.prostava_data.venue.location = TelegramUtils.getLocationMessage(ctx).location;
        await next();
    }
    static async changeProstavaCost(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        prostava.prostava_data.cost = ProstavaUtils.fillProstavaCostFromText(
            TelegramUtils.getTextMessage(ctx).text,
            ctx.group.settings.currency
        );
        await next();
    }

    static async isProstavaDataFull(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if ((prostava as ProstavaDocument).validateSync()) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_CREATE));
            return;
        }
        await next();
    }
    static async announceProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        prostava.participants_min_count = Math.ceil(
            (ctx.group.settings.chat_members_count * ctx.group.settings.participants_min_percent) / 100
        );
        prostava.participants_max_count = ctx.group.settings.chat_members_count - 1;
        prostava.status = ProstavaStatus.Pending;
        prostava.closing_date = DateUtils.getNowDatePlusHours(ctx.group.settings.pending_hours);
        ctx.group.prostavas.push(prostava);
        await next();
    }

    static async isUserParticipantOfProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        if (ProstavaUtils.isUserAuthorOfPrastava(prostava, user.id)) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_RATE));
            return;
        }
        await next();
    }
    static async changeProstavaParticipantRating(ctx: UpdateContext, next: Function) {
        const rating = Number(ObjectUtils.parseActionData(TelegramUtils.getCbQueryData(ctx)).value);
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const user = TelegramUtils.getUserFromContext(ctx);
        let participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user.id);
        if (participant?.rating === rating) {
            ctx.answerCbQuery();
            return;
        }
        if (!participant) {
            prostava.participants.push({ user: ctx.user });
            participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user.id);
        }
        participant.rating = rating;
        prostava.rating = ProstavaUtils.updateTotalRating(prostava.participants);
        await next();
    }

    static async isProstavaPendingCompleted(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!ProstavaUtils.isProstavaPendingCompleted(prostava)) {
            return;
        }
        await next();
    }
    static async publishProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (ProstavaUtils.filterParticipantsWere(prostava.participants)?.length < prostava.participants_min_count) {
            prostava.status = ProstavaStatus.Rejected;
        } else {
            prostava.status = ProstavaStatus.Approved;
        }
        prostava.closing_date = new Date();
        await next();
    }

    static async hasUserPendingProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!ProstavaUtils.isProstavaPending(prostava)) {
            return;
        }
        await next();
    }
    static async withdrawProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        try {
            await (prostava as ProstavaDocument).delete();
        } catch {
            //TODO Logger
            return;
        }
        ctx.group.prostavas = ProstavaUtils.deleteProstavaById(ctx.group.prostavas, prostava);
        prostava.status = ProstavaStatus.New;
        ctx.session.prostava = new ProstavaCollection(ProstavaUtils.fillProstavaFromDeleted(prostava));
        delete ctx.prostava;
        await next();
    }

    static async saveProstava(ctx: UpdateContext, next: Function) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if ((prostava as ProstavaDocument).isModified()) {
            try {
                await (prostava as ProstavaDocument).save();
            } catch {
                //TODO Logger
                return;
            }
        }
        await next();
    }
}
