import { model, Schema } from "mongoose";
import { PROSTAVA, LOCALE, CODE } from "../constants";
import { GroupModel, GroupDocument } from "../types";
const mongooseAutoPopulate = require("mongoose-autopopulate");

const GroupSettinsSchema = new Schema(
    {
        language: {
            type: String,
            default: LOCALE.LANGUAGE.EN,
            minLength: 2,
            maxLength: 2
        },
        currency: {
            type: String,
            default: CODE.CURRENCY.DOLLAR,
            minLength: 1,
            maxLength: 1
        },
        create_days_ago: {
            type: Number,
            default: 0
        },
        chat_members_count: {
            type: Number,
            default: 0
        },
        participants_min_percent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        pending_hours: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const GroupSchema = new Schema<GroupDocument, GroupModel>(
    {
        _id: Number,
        settings: {
            type: GroupSettinsSchema,
            default: {}
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: PROSTAVA.COLLECTION.USER,
                autopopulate: true
            }
        ],
        prostavas: [
            {
                type: Schema.Types.ObjectId,
                ref: PROSTAVA.COLLECTION.PROSTAVA,
                autopopulate: true
            }
        ]
    },
    { _id: false }
);

GroupSchema.plugin(mongooseAutoPopulate);

export const GroupCollection = model<GroupDocument, GroupModel>(PROSTAVA.COLLECTION.GROUP, GroupSchema);
