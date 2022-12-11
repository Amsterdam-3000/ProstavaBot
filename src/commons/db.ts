import { connect, connection, set } from "mongoose";
import { CONFIG } from "./config";

//Connect to MongoDB
connect(CONFIG.MONGODB_URL!);

//Return updating objects
set("returnOriginal", false);

export const mongo = connection;
