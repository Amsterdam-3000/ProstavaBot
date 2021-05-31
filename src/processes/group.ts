import Queue from "bull";
import { GroupUtils } from "../utils";

export class GroupProcess {
    static async updateGroupCalendarsOfProstavas(job: Queue.Job) {
        const groups = await GroupUtils.getAllGroupsFromDB();
        //TODO Parallel?
        groups.forEach((group) => {
            GroupUtils.populateGroupProstavas(group);
            GroupUtils.saveGroupCalendarOfProstavasToPublic(group);
        });
    }
}
