import express from "express";
const router = express.Router()
import {modifier, reserver, supprimer, trouver} from "../controllers/reservationController.js";
router.post("/reservation", reserver)
router.delete("/reservation/suppression", supprimer)
router.put("/reservation/modifier", modifier);
router.get("/reservations", trouver)

export default  router;
