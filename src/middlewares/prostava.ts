import { CODE, PROSTAVA } from "../constants";
import { ProstavaCollection } from "../models";
import { Prostava, ProstavaDocument, ProstavaStatus, UpdateContext } from "../types";
import { DateUtils, LocaleUtils, ConverterUtils, ProstavaUtils, TelegramUtils } from "../utils";

export class ProstavaMiddleware {
    static async addPendingProstavaToContext(ctx: UpdateContext, next: () => Promise<void>) {
        if (!ProstavaUtils.getProstavaFromContext(ctx)) {
            const user = TelegramUtils.getUserFromContext(ctx);
            ctx.prostava = ProstavaUtils.filterUserProstavas(ctx.group.prostavas, user?.id).find((prostava) =>
                ProstavaUtils.isProstavaPending(prostava)
            );
        }
        await next();
    }
    static async addProstavaFromActionToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        ctx.prostava = (ctx.group.prostavas as [Prostava]).find(
            (prostava) => (prostava as ProstavaDocument).id === actionData?.id
        );
        await next();
    }
    static async addNewProstavaToContext(ctx: UpdateContext, next: () => Promise<void>) {
        if (!ProstavaUtils.getProstavaFromContext(ctx)) {
            const user = TelegramUtils.getUserFromContext(ctx);
            ctx.prostava = ProstavaUtils.filterUserProstavas(ctx.group.prostavas, user?.id).find((prostava) =>
                ProstavaUtils.isProstavaNew(prostava)
            );
        }
        if (
            TelegramUtils.isMessageCommand(ctx, PROSTAVA.COMMAND.PROSTAVA) &&
            !ProstavaUtils.getProstavaFromContext(ctx)
        ) {
            ctx.prostava = new ProstavaCollection(ProstavaUtils.fillProstavaFromText(ctx));
            ctx.group.prostavas.push(ctx.prostava);
        }
        await next();
    }

    static async changeProstavaType(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        if (!actionData || actionData.value === prostava?.prostava_data?.type) {
            ctx.answerCbQuery();
            return;
        }
        if (prostava) {
            prostava.prostava_data.type = actionData.value;
        }
        await next();
    }
    static async changeProstavaOrVenueTitle(ctx: UpdateContext, next: () => Promise<void>) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            switch (ConverterUtils.parseActionData(sceneState.actionData)?.action) {
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
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.date = new Date(
                ConverterUtils.sliceCalendarActionDate(TelegramUtils.getCbQueryData(ctx))
            );
        }
        await next();
    }
    static async changeProstavaVenue(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.venue = TelegramUtils.getVenueMessage(ctx).venue;
        }
        await next();
    }
    static async changeProstavaLocation(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.venue.location = TelegramUtils.getLocationMessage(ctx).location;
        }
        await next();
    }
    static async changeProstavaCost(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.prostava_data.cost = ProstavaUtils.fillProstavaCostFromText(
                TelegramUtils.getTextMessage(ctx).text,
                ctx.group.settings.currency
            );
        }
        await next();
    }

    static async isProstavaDataFull(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava || (prostava as ProstavaDocument).validateSync()) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_CREATE));
            return;
        }
        await next();
    }
    static async announceProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.participants_max_count = ctx.group.settings.chat_members_count - 1;
            prostava.participants_min_count = Math.ceil(
                (prostava.participants_max_count * ctx.group.settings.participants_min_percent) / 100
            );
            prostava.status = ProstavaStatus.Pending;
            prostava.closing_date = DateUtils.getNowDatePlusHours(ctx.group.settings.pending_hours);
        }
        await next();
    }

    static async isUserParticipantOfProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
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
    static async changeProstavaParticipantRating(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            ctx.answerCbQuery();
            return;
        }
        const rating = Number(ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx))?.value);
        const user = TelegramUtils.getUserFromContext(ctx);
        let participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user?.id);
        if (participant?.rating === rating) {
            ctx.answerCbQuery();
            return;
        }
        if (!participant) {
            prostava.participants.push({ user: ctx.user, rating: 0 });
            participant = ProstavaUtils.findParticipantByUserId(prostava.participants, user?.id);
        }
        if (participant) {
            participant.rating = rating;
            prostava.rating = ProstavaUtils.updateTotalRating(prostava.participants);
        }
        await next();
    }

    static async isProstavaPendingCompleted(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava || !ProstavaUtils.canCompletePendingProstava(prostava)) {
            return;
        }
        await next();
    }
    static async publishProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!prostava) {
            return;
        }
        if (ProstavaUtils.canApprovePendingProstava(prostava)) {
            prostava.status = ProstavaStatus.Approved;
        } else {
            prostava.status = ProstavaStatus.Rejected;
        }
        prostava.closing_date = new Date();
        await next();
    }

    static async hasUserPendingProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (!ProstavaUtils.isProstavaPending(prostava)) {
            return;
        }
        await next();
    }
    static async withdrawProstava(ctx: UpdateContext, next: () => Promise<void>) {
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava) {
            prostava.status = ProstavaStatus.New;
            prostava.participants = [];
            prostava.rating = 0;
            delete prostava.closing_date;
            delete prostava.participants_max_count;
            delete prostava.participants_min_count;
        }
        await next();
    }

    static async saveProstava(ctx: UpdateContext, next: () => Promise<void>) {
        await next();
        const prostava = ProstavaUtils.getProstavaFromContext(ctx);
        if (prostava && (prostava as ProstavaDocument).isModified()) {
            try {
                await (prostava as ProstavaDocument).save();
            } catch (err) {
                console.log(err);
            }
        }
    }
}
