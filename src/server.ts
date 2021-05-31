import express from "express";
import { CONFIG } from "./commons/config";

const app = express();

app.use(express.static("public"));

app.get("/api/calendar/apple/:calendarId", (req, res) => {
    res.redirect(`webcal://${req.headers.host}/calendar/${req.params.calendarId}.ics`);
});

app.get("/api/calendar/google/:calendarId", (req, res) => {
    res.redirect(
        `https://calendar.google.com/calendar/u/0/r/month?cid=http://${req.headers.host}/calendar/${req.params.calendarId}.ics`
    );
});

app.listen(process.env.PORT || CONFIG.PROSTAVA_PORT, () => {
    console.log(`Prostava is listening on port ${CONFIG.PROSTAVA_PORT}`);
});
