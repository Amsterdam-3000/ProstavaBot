import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { I18nContext } from "@grammyjs/i18n";
import { Markup } from "telegraf";

import { PROSTAVA } from "../constants";
import { Group } from "../types";
import { ConverterUtils } from "../utils";
import { CommonView } from "./common";

export class GroupView {
    static getGroupsKeyboard(
        i18n: I18nContext,
        groupId: Group["_id"],
        groups?: Group[]
    ): Markup.Markup<InlineKeyboardMarkup> {
        return Markup.inlineKeyboard([...this.getGroupButtons(groupId, groups), CommonView.getExitButton(i18n)], {
            columns: groups?.length && groups.length > 10 ? 7 : 1
        });
    }

    private static getGroupButtons(groupId: Group["_id"], groups?: Group[]) {
        return (groups as Group[]).map((group) =>
            Markup.button.callback(
                ConverterUtils.displaySelectedValue(group.settings.name, group._id === groupId),
                ConverterUtils.stringifyActionData(PROSTAVA.ACTION.GROUP_GROUP, group._id.toString())
            )
        );
    }
}
