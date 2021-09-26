import { urlencoded, json } from "body-parser";
import cors from "cors";

import { CONFIG } from "./commons/config";
import { db } from "./commons/db";
import { server } from "./commons/server";
import { CalendarController, AuthController } from "./controllers";
import { AuthMiddleware } from "./middlewares";

db.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

db.once("open", () => {
    //Global
    server.use(urlencoded({ extended: false }));
    server.use(json());
    server.use(cors());
    server.use(AuthMiddleware.checkUserAuth());

    //Calendar
    server.get("/api/calendar/:groupId.ics", CalendarController.sendGroupCalendarOfProstavas);
    server.get("/api/calendar/apple/:groupId", CalendarController.redirectToAppleCalendar);
    server.get("/api/calendar/google/:groupId", CalendarController.redirectToGoogleCalendar);

    //ProstavaWeb
    server.post("/api/login", AuthController.loginToProstavaWeb);
    server.get("/api/protected", async (req, res) => {
        res.json({ message: "OKK" });
    });

    server.listen(CONFIG.PROSTAVA_PORT, () => {
        console.log(`Prostava is listening on port ${CONFIG.PROSTAVA_PORT}`);
    });
});
