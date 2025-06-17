import express from "express";
const router = express.Router();
import { inscription, connexion, refreshToken} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.get("/refresh", refreshToken);

// Exemple route protégée
router.get("/profil", verifyToken, (req, res) => {
    res.json({ message: "Bienvenue !" + req.user.nom, user: req.user });
});
export default router;
