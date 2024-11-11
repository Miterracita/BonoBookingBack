require("dotenv").config();
const express = require("express");

const { connectDB } = require("./src/config/db");
const { connectCloudinary } = require("./src/config/cloudinary");

const userRoutes = require("./src/api/routes/user");
const bonoRoutes = require("./src/api/routes/bono");
const eventoRoutes = require("./src/api/routes/evento");
const bookingRoutes = require("./src/api/routes/booking");

const cors = require("cors");

const app = express();

connectDB();
connectCloudinary();

//autorizamos a realizar peticiones al back
const corsOptions = {
    origin: 'https://bono-booking-front.vercel.app',
    optionsSuccessStatus: 200
  };
app.use(cors(corsOptions));

// Encabezados adicionales para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://bono-booking-front.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// para que pueda ser capaz de entender el formato .json
app.use(express.json());

app.use("/users", userRoutes);
app.use("/bonos", bonoRoutes);
app.use("/events", eventoRoutes);
app.use("/bookings", bookingRoutes);

app.use("*", (req, res, next) => {
    return res.status(404).json("Ruta no encontrada")
})

app.listen(3000, () => {
    console.log("El servidor está funcionando");
})
