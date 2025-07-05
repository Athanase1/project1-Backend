import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/DetailReservation.js";

export const reserver = async (req, res) => {
    try {
        const { date, nbPersonnes, occasion, heure, nom, prenom, tel, email } = req.body;

        // Créer la réservation principale
        const reservation = new Reservation({
            date,
            nbPersonnes,
            occasion,
            heure,
        });

        await reservation.save();

        // Créer les détails liés à la réservation
        const detail = new ReservationDetail({
            id_reservation: reservation._id, // on lie avec l'ObjectId correct
            nom,
            prenom,
            tel,
            email,
        });

        await detail.save();

        res.status(200).json({
            message: "Réservation confirmée avec succès !",
            reservation,
            detail,
        });

    } catch (e) {
        console.error("Erreur lors de la réservation :", e);
        res.status(500).json({
            message: "Erreur du serveur, réessayez à nouveau !",
        });
    }
};
export const trouver = async (req, res) => {
    try {
        const { tel } = req.query;

        if (!tel) {
            return res.status(400).json({ message: "Numéro de téléphone manquant." });
        }

        const details = await ReservationDetail.find({ tel }).populate("id_reservation");

        if (details.length === 0) {
            return res.status(200).json({
                message: "Aucune réservation liée à ce numéro.",
            });
        }

        return res.status(200).json({
            reservations: details,
            message: "Liste des réservations avec détails.",
        });

    } catch (e) {
        console.error("Erreur lors de la recherche :", e);
        return res.status(500).json({
            message: "Erreur serveur.",
        });
    }
};

export const modifier = async (req, res) => {
    try {
        const {
            id,
            date,
            nbPersonnes,
            occasion,
            heure,
            nom,
            prenom,
            tel,
            email,
        } = req.body;

        // Mise à jour de la réservation principale
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { date, nbPersonnes, occasion, heure },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        // Mise à jour des détails associés
        const details = await ReservationDetail.findOneAndUpdate(
            { id_reservation: id },
            { nom, prenom, tel, email },
            { new: true }
        );

        res.status(200).json({
            message: "Réservation mise à jour avec succès.",
            reservation,
            details,
        });
    } catch (e) {
        console.error("Erreur de modification :", e.message);
        res.status(500).json({
            message: "Erreur lors de la modification !",
        });
    }
};

