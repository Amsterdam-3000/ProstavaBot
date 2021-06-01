import express from "express";
import { CONFIG } from "./commons/config";
import { resolve } from "path";

const app = express();

console.log("save:\n", __dirname, "\n", process.env.PWD, "\n", process.cwd());
console.log(resolve(__dirname, "../", "public/calendar"));
app.use("/calendar", express.static(resolve(__dirname, "../", "public/calendar")));

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
