import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import bcrypt from "bcrypt";

export const connexion = async (req, res) => {
    try {
        const { email, password } = req.body;
        const utilisateur = await User.findOne({ email });

        if (!utilisateur)
            return res.status(401).json({ message: "email invalide" });

        const passwordValide = await bcrypt.compare(password, utilisateur.password);
        if (!passwordValide)
            return res.status(401).json({ message: "Mot de passe invalide" });

        const accessToken = jwt.sign(
            { id: utilisateur._id, email: utilisateur.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: utilisateur._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "connexion réussie",
            token: accessToken,
            utilisateur: {
                id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                tel:utilisateur.tel,
                email: utilisateur.email,
            },
        });
    } catch (err) {
        console.log("Erreur connexion :", err);
        res.status(500).json({ message: "erreur du serveur" });
    }
};

export const inscription = async (req, res) => {
    try {
        const { nom, prenom, email, tel, password } = req.body;
        const utilisateur = await User.findOne({ email });

        if (utilisateur)
            return res.status(401).json({ message: "email déjà inscrit connectez-vous ou utiliser un autre émail" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const nouvelUtilisateur = new User({
            nom,
            prenom,
            email,
            tel,
            password: hashedPassword,
        });

        await nouvelUtilisateur.save();
        const accessToken = jwt.sign(
            { id: nouvelUtilisateur._id, email: nouvelUtilisateur.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { id: nouvelUtilisateur._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });
        res.status(200).json({
            message: "connexion réussie",
            token: accessToken,
            utilisateur: {
                id: nouvelUtilisateur._id,
                nom: nouvelUtilisateur.nom,
                prenom: nouvelUtilisateur.prenom,
                email: nouvelUtilisateur.email,
            },
        });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

export const refreshToken = (req, res) => {
    const refresh = req.cookies.refreshToken;

    if (!refresh) return res.status(401).json({ message: "Token manquant" });

    jwt.verify(refresh, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token invalide" });

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token: newAccessToken });
    });
};
export const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ message: "Déconnecté avec succès" });
};
export const supprimerUtilisateur = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
