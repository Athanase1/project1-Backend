import express from "express";
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv";
import route from "./routes/auth.js";
import route1 from "./routes/reservation.js"
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:3000",
    "https://athanase1.github.io",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MonGODB connecté"))
.catch(err => console.log(err.message));

app.use('/api/users', route); // authentification
app.use('/api/reservations', route1) // reservations

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`serveur running on ${PORT}`));