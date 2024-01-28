require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
const { connectMonggose } = require('./app/database/db')
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();
// ******************  Enable CORS  ********************//
app.use(cors());

// ************************  Database Connection  **********************************//
connectMonggose();

// ****************    Security Headers   ****************************//
// app.use(helmet());

// *************************    Assets    ****************************************//
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use("/uploads", express.static("uploads"))

// *************   Body parsing middleware  ************************//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())


// *********************************** API Routes ********************************//
userRoutes(app);
blogRoutes(app);

// ************************   Port Start   ********************************//
const PORT = process.env.PORT || 8500;
app.listen(PORT, () => {
    console.log(`My server start on this port ${PORT}`)
})
