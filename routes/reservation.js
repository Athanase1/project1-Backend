import express from "express";
const router =express.Router()
import {reserver} from "../controllers/reservationController.js";
router.post("/reservation", reserver)
export default  router;
