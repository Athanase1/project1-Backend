import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/DetailReservation.js";

export const reserver = async ( req,res) =>{
    try{
      const {date, nbPersonnes,occasion,heure,nom,prenom,tel,email} = req.body
        const reservation = new Reservation({
            date,
            nbPersonnes,
            occasion,
            heure,
        })

        await reservation.save();

      const detail = new ReservationDetail({
          id_reservation:tel,
          nom,
          prenom,
          tel,
          email,
      })
        await detail.save()

        res.status(200).json({
          message:"Reservation confirmée avec succèss!",
      })
    } catch (e) {
        res.status(500).json({
            message:"Erreur du serveur ressayez à nouveau!"
        })
    }
}
export const trouver = async (req, res) => {
    try {
        const { tel } = req.query;

        if (!tel) {
            return res.status(400).json({ message: "Email manquant dans la requête." });
        }

        const reservations = await ReservationDetail.find({ tel });

        if (reservations.length === 0) {
            return res.status(404).json({
                message: "Aucune réservation liée à cet numéro de tel.",
            });
        }

        res.status(200).json({
            reservations,
            message: "Voici la liste des réservations liées à cet num de tel.",
        });

    } catch (e) {
        console.error("Erreur lors de la recherche de réservations :", e);
        res.status(500).json({
            message: "Erreur du serveur, veuillez réessayer.",
        });
    }
};
export const supprimer = async (req, res) => {
    try {
        const { id } = req.body;

        const deleted = await Reservation.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Réservation non trouvée.",
            });
        }

        return res.status(200).json({
            message: "Réservation supprimée avec succès.",
        });

    } catch (e) {
        console.error("Erreur de suppression :", e.message);
        res.status(500).json({
            message: "Erreur lors de la suppression !",
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

        // Mise à jour des détails si tu as un modèle ReservationDetail lié
        await ReservationDetail.findOneAndUpdate(
            { id_reservation: id },
            { nom, prenom, tel, email },
            { new: true }
        );

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
