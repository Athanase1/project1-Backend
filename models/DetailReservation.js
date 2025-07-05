import mongoose from "mongoose";

const ReservationDetailSchema = new mongoose.Schema({
    id_reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation", // Le nom du modèle référencé
        required: true,
    },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    tel: { type: String, required: false },
    email: { type: String, required: true },
    specification: { type: String, required: false },
});

const ReservationDetail = mongoose.model("ReservationDetail", ReservationDetailSchema);
export default ReservationDetail;