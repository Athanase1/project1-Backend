import express from "express";
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv";
import route from "./routes/auth.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MonGODB connecté"))
.catch(err => console.log(err));

app.use('/api/users', route);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`serveur running on ${PORT}`));