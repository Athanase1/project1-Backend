import mongoose from "mongoose";

const ReservationDetailSchema = new mongoose.Schema(
    {
            id_reservation:{type:String, required:true},
        nom: {type: String, required: true},
        prenom: {type: String, required: true},
        numero: {type: String, required: false},
        email: {type: String, required: true},
        specification: {type: String, required: false}
    }
)
const ReservationDetail = mongoose.model('ReservationDetail', ReservationDetailSchema)
export default ReservationDetail;