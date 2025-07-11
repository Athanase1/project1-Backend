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
        } = req.body;
        // vérification;
        if (!id || !date || !nbPersonnes || !occasion || !heure) {
            return res.status(400).json({ message: "Champs manquants pour la mise à jour." });
        }

        // Mise à jour de la réservation principale
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { date, nbPersonnes, occasion, heure },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }
        res.status(200).json({
            message: "Réservation mise à jour avec succès.",
            reservation,

        });
    } catch (e) {
        console.error("Erreur de modification :", e.message);
        res.status(500).json({
            message: "Erreur lors de la modification !",
        });
    }
};
export const supprimer = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID de réservation manquant." });
        }

        // Supprimer la réservation principale
        const deletedReservation = await Reservation.findByIdAndDelete(id);

        if (!deletedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        // Supprimer les détails liés à cette réservation
        await ReservationDetail.deleteOne({ id_reservation: id });

        return res.status(200).json({
            message: "Réservation et ses détails supprimés avec succès.",
        });

    } catch (e) {
        console.error("Erreur lors de la suppression :", e);
        return res.status(500).json({
            message: "Erreur du serveur lors de la suppression.",
        });
    }
};

