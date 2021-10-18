import { urlencoded, json } from "body-parser";
import cors from "cors";

import { CONFIG } from "./commons/config";
import { server } from "./commons/server";
import { apiRouter } from "./routers";

export function launchServer(): void {
    //Global
    server.use(urlencoded({ extended: false }));
    server.use(json());
    server.use(cors());

    //API Routes
    server.use("/api", apiRouter);

    server.listen(CONFIG.PROSTAVA_PORT, () => {
        console.log(`Prostava API is listening on port ${CONFIG.PROSTAVA_PORT}`);
    });
}
