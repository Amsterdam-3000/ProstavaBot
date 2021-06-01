import { CONFIG } from "./commons/config";
import { db } from "./commons/db";
import { server } from "./commons/server";
import { CalendarController } from "./controllers";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    server.get("/api/calendar/:groupId.ics", CalendarController.sendGroupCalendarOfProstavas);
    server.get("/api/calendar/apple/:groupId", CalendarController.redirectToAppleCalendar);
    server.get("/api/calendar/google/:groupId", CalendarController.redirectToGoogleCalendar);

    server.listen(CONFIG.PROSTAVA_PORT, () => {
        console.log(`Prostava is listening on port ${CONFIG.PROSTAVA_PORT}`);
    });
});
