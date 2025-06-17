import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token expiré" });
        }
        console.error("Erreur de vérification du token :", err);
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
};

