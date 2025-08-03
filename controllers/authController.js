import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import bcrypt from "bcrypt";
import {transporteur} from "../services/mailService.js";

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
                tel:nouvelUtilisateur.tel,
            },
        });
        const html =`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez Little Lemon</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; color: #333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: white; border-radius: 8px; padding: 20px;">
          <tr>
            <td style="text-align: center;">
              <h2 style="color: #4CAF50;">Bienvenue chez Little Lemon, ${prenom} !</h2>
              <p style="font-size: 16px;">Nous sommes ravis de vous compter parmi nos membres.</p>
            </td>
          </tr>

          <tr>
            <td>
              <p>🍋 En créant votre compte, vous pouvez désormais :</p>
              <ul style="list-style: none; padding: 0; line-height: 1.6;">
                <li>✅ Réserver une table facilement</li>
                <li>✅ Gérer vos réservations</li>
                <li>✅ Recevoir des offres exclusives</li>
              </ul>
              <p style="margin-top: 20px;">Nous espérons vous voir bientôt dans notre restaurant !</p>
              <p style="font-weight: bold;">– L’équipe de Little Lemon 🍋</p>
            </td>
          </tr>
        </table>

        <table width="100%" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #888;">
              <p style="margin: 5px;">&copy; Little Lemon ${new Date().getFullYear()}. Tous droits réservés.</p>
              <a href="https://athanase1.github.io/resto-littlelemon/" target="_blank" style="color: #888; text-decoration: none;">www.littleLemon.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

        try{
            transporteur.sendMail({
                from:`"Restaurant little lemon" <${process.env.MAIL_USER}>`,
                to:email,
                subject:"Création de compte",
                html:html,
            })
        }catch (e) {
           res.status(200).json({
               message:"Erreur d'envoie de courriel"
           })
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

export const refreshToken = (req, res) => {
    const refresh = req.cookies.refreshToken;

    if (!refresh) return res.status(401).json({ message: "Token manquant" });

    jwt.verify(refresh, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token invalide" });

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
