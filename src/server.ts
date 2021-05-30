import express from "express";
import { CONFIG } from "./commons/config";

const app = express();

app.use(express.static("public"));

app.listen(CONFIG.PROSTAVA_PORT, () => {
    console.log(`Prostava is listening on port ${CONFIG.PROSTAVA_PORT}`);
});
