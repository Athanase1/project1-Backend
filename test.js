import mongoose from "mongoose";

mongoose.connect('mongodb+srv://Athanase:Hawa2019%3F@cluster0.tlduzil.mongodb.net/littlelemon?retryWrites=true&w=majority')
    .then(() => console.log("✅ Connexion MongoDB réussie"))
    .catch(err => console.error("❌ Erreur MongoDB :", err));