import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/DetailReservation.js";
import {transporteur} from "../services/mailService.js";

export const reserver = async (req, res) => {
    try {
        const { date, nbPersonnes, occasion, heure, nom, prenom, tel, email } = req.body;

        if (!date || !nbPersonnes || !occasion || !heure || !nom || !prenom || !tel || !email) {
            return res.status(400).json({
                success: false,
                message: "Info manquante",
            });
        }

        const reservation = new Reservation({
            date,
            nbPersonnes,
            occasion,
            heure,
        });

        await reservation.save();

        const detail = new ReservationDetail({
            id_reservation: reservation._id,
            nom,
            prenom,
            tel,
            email,
        });

        await detail.save();
        const html =  `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; color: #333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px; width: 100%;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: white; border-radius: 8px; padding: 20px; width: 100%">
          <tr>
            <td style="text-align: center;">
              <h2 style="color: #4CAF50; margin-bottom: 0;">Merci pour votre réservation, ${prenom} ${nom} !</h2>
              <p style="margin-top: 5px;">🎉 Votre table est réservée chez <strong>Little Lemon</strong>.</p>
            </td>
          </tr>

          <tr>
            <td>
              <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">🗓️ Détails de la réservation</h3>
              <ul style="list-style: none; padding: 0; line-height: 1.6;">
                <li><strong>Date :</strong> ${date}</li>
                <li><strong>Heure :</strong> ${heure}</li>
                <li><strong>Nombre de personnes :</strong> ${nbPersonnes}</li>
                <li><strong>Occasion :</strong> ${occasion ? occasion : "Non précisée"}</li>
              </ul>
              <p>📞 Téléphone : ${tel}</p>
              <p>📧 Email : ${email}</p>
            </td>
          </tr>

          <tr>
            <td style="padding-top: 20px;">
              <p style="margin: 0;">Si vous avez des questions ou souhaitez modifier votre réservation, contactez-nous à tout moment.</p>
              <p style="margin-top: 10px;">Au plaisir de vous accueillir !</p>
              <p style="font-weight: bold;">– L’équipe de Little Lemon 🍋</p>
            </td>
          </tr>
        </table>

        <table width="100%" style="max-width: 600px; margin-top: 20px; width: 100%">
          <tr>
            <td style="font-size: 12px; color: #888; text-align: center">
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

        try {
            transporteur.sendMail({
                from:`"Restaurant LittleLemon" <${process.env.MAIL_USER}>`,
                to:email,
                subject:"Reservation",
                message:"Reservation à venir pour vous!",
                html:html,
            })
        }catch (e) {
            return  res.status(500).json({
                message:"Erreur lors d'envoie de courriel"
            })
        }

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
      const detailRes =  await ReservationDetail.deleteOne({ id_reservation: id });
        try {
            transporteur.sendMail({
                from:`"Restaurant LittleLemon" <${process.env.MAIL_USER}>`,
                to:detailRes.email,
                subject:"Reservation",
                message:"Reservation annulée avec succès!"
            })
        }catch (e) {
           return  res.status(500).json({
               message:"Erreur lors d'envoie de courriel"
           })
        }

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

