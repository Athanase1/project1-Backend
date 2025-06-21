import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/DetailReservation.js";
export const reserver = async (res, req) =>{
    try{
      const {date, nbPersonnes,occasion,heure,nom,prenom,tel,email} = req.body
        const reservation = new Reservation({
            date,
            nbPersonnes,
            occasion,
            heure,
        })

        await reservation.save();
      const id_reservation = reservation._id.toString();
      const detail = new ReservationDetail({
          id_reservation,
          nom,
          prenom,
          tel,
          email,
      })
        await detail.save()
      res.status(200).json({
          message:"Rerservation confirmé avec succèss",
          reservation:{
              date,
              nbPersonnes,
              occasion,
              heure,
          },
          detail:{
              id_reservation,
              nom,
              prenom,
              tel,
              email
          }
      })
    } catch (e) {
        res.status(500).json({
            message:"Erreur du serveur ressayez à nouveau!"
        })
    }
}