import express from "express";
const router = express.Router()
import {modifier, reserver, supprimer} from "../controllers/reservationController.js";
router.post("/reservation", reserver)
router.delete("/reservation/suppression", supprimer)
router.post("reservation/modifier", modifier)

export default  router;
