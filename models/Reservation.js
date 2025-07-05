import mongoose from "mongoose";
const ReservationSchema = new mongoose.Schema({
    date: { type: String, required: true },
    nbPersonnes: { type: String, required: true },
    occasion: { type: String, required: true },
    heure: { type: String, required: true },
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
export default Reservation;