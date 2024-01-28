require('dotenv').config()
const mongoose = require('mongoose');
exports.connectMonggose = () => {
    mongoose.connect(process.env.DATABASE_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Connected to MongoDB: Blog");
        })
        .catch((error) => {
                console.error("Failed to connect to MongoDB:", error.message);
        });

}