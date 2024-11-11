const cloudinary = require("cloudinary").v2;

const connectCloudinary = () => {
    try {

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            api_key: process.env.CLOUDINARY_API_KEY
        })

        console.log("La conexión a cloudinary se ha realizado con éxito");

    } catch (error) {

        console.log("La conexión a cloudinary no se ha podido realizar");
    }
}

module.exports = { connectCloudinary }