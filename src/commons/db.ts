import { connect, connection } from "mongoose";
import { CONFIG } from "./config";

//Connect to MongoDB
connect(CONFIG.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

export const db = connection;
