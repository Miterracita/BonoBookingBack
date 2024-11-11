const mongoose = require('mongoose');
const fs = require('fs');

const User = require('../api/models/User');
const Bono = require('../api/models/bono');
const Evento = require('../api/models/evento');
const Booking = require("../api/models/booking");

// Función para leer y procesar el archivo CSV
const leerCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (error, data) => {
            if (error) {
                return reject("Error leyendo el archivo CSV:", error);
            }
            // console.log("Contenido del archivo CSV:", data);

            const arrayDefinitivo = [];
            const filas = data.split("\n");

            for (let i = 1; i < filas.length; i++) {
                const fila = filas[i];
                if (!fila.trim()) continue;

                const columna = fila.split(';');
                const obj = {};

                for (let j = 0; j < columna.length; j++) {
                    obj[filas[0].split(';')[j]] = columna[j];
                }

                // Convertir las fechas al formato adecuado (yyyy-mm-dd)
                if (obj.expirationDate) {
                    obj.expirationDate = convertirFecha(obj.expirationDate);  //--> para los bonos
                }
                if (obj.date) {
                    obj.date = convertirFecha(obj.date); // para los eventos
                }

                arrayDefinitivo.push(obj);
            }

            resolve(arrayDefinitivo);
        });
    });
};

// Función para convertir una fecha de formato "dd/mm/yyyy" a "yyyy-mm-dd"--> para los bonos
const convertirFecha = (fecha) => {
    const partes = fecha.split('/');
    if (partes.length === 3) {
        // Formato "dd/mm/yyyy"
        return `${partes[2]}-${partes[1]}-${partes[0]}`; // Devuelve el formato "yyyy-mm-dd"
    }
    return fecha; // Si no tiene un formato esperado, devuelve la fecha tal cual
};

// Conexión a la base de datos
const mongoURI = 'mongodb+srv://anadiseny:lJEBorFz0Va4tZcJ@bonobooking.72dzv.mongodb.net/';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a la base de datos', error);
    }
};

// Borra los datos anteriores y reinicia con datos nuevos
const clearData = async () => {
    try {
        await User.deleteMany({});
        await Bono.deleteMany({});
        await Evento.deleteMany({});
        await Booking.deleteMany({});
        console.log('Datos eliminados');
    } catch (error) {
        console.error('Error al eliminar datos', error);
    }
};

// Función para insertar datos en la base de datos
const insertarDatos = async () => {
    try {

        await connectDB();
        console.log('Conectado a la base de datos...');

        await clearData();
        console.log('Borrando bbdd...');


        // Leer datos del archivo CSV
        const usuariosCSV = await leerCSV('./src/utils/csv/users.csv');
        const bonosCSV = await leerCSV('./src/utils/csv/bonos.csv');
        const eventosCSV = await leerCSV('./src/utils/csv/events.csv');
        const reservasCSV = await leerCSV('./src/utils/csv/bookings.csv');

        // Insertar usuarios
        const usuarios = await User.insertMany(usuariosCSV);
        console.log(`Usuarios insertados: ${usuarios.length}`);

        // Insertar bonos y asignar usuarios (relación entre bonos y usuarios)
        for (let bonoData of bonosCSV) {
            // Encontrar el usuario correspondiente al bono
            const usuario = await User.findById(bonoData['user (ID)']);
            if (usuario) {
                bonoData.user = usuario._id;
            }
            await Bono.create(bonoData);
        }
        console.log('Bonos insertados');

        // Insertar eventos
        const eventos = await Evento.insertMany(eventosCSV);
        console.log(`Eventos insertados: ${eventos.length}`);

        // Insertar reservas
        for (let reservaData of reservasCSV) {
            const bono = await Bono.findById(reservaData.bono);
            const evento = await Evento.findById(reservaData.evento);

            if (bono && evento) {
                const reserva = new Booking({
                    localizador: reservaData.localizador,
                    evento: evento._id,
                    bono: bono._id
                });
                await reserva.save();
            }
        }
        console.log('Reservas insertadas');

        // Cerrar conexión
        mongoose.connection.close();
    } catch (error) {
        console.error("Error al insertar los datos:", error);
    }
};

// Ejecutar la semilla
insertarDatos();
