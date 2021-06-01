import express from "express";
import { CONFIG } from "./commons/config";
import { resolve } from "path";

const app = express();

app.use(express.static(resolve(__dirname, "../", "public")));

app.get("/api/calendar/apple/:calendarId", (req, res) => {
    res.redirect(`webcal://${req.headers.host}/calendar/${req.params.calendarId}.ics`);
});

app.get("/api/calendar/google/:calendarId", (req, res) => {
    res.redirect(
        `https://calendar.google.com/calendar/u/0/r/month?cid=https://${req.headers.host}/calendar/${req.params.calendarId}.ics`
    );
});

app.listen(CONFIG.PROSTAVA_PORT, () => {
    console.log(`Prostava is listening on port ${CONFIG.PROSTAVA_PORT}`);
});
