import { connect, connection, set } from "mongoose";
import { CONFIG } from "./config";

//Connect to MongoDB
connect(CONFIG.MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Return updating objects
set("returnOriginal", false);
//Use findOneAndUpdate instead
set("useFindAndModify", false);

export const db = connection;
