const cloudinary = require("cloudinary").v2;

//con esta funcion eliminamos de cloudinary las imagenes subidas al eliminar un evento
const deleteFile = (url) => {

    const imgURl = url.split("/");
    const foldername = imgURl.at(-2);
    const filename = imgURl.at(-1).split(".");

    let public_id = `${foldername}/${filename[0]}`;

    cloudinary.uploader.destroy(public_id, () => {
        console.log("La imagen se ha eliminado");
    })
};

module.exports = { deleteFile }