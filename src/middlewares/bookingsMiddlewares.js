
//generar string aleatorio de 5 caracteres
function generateCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function preSave(next) {
    if (!this.localizador) {
        let unique = false;
        while (!unique) {
            this.localizador = generateCode();
            const existingBooking = await mongoose.models.Booking.findOne({ localizador: this.localizador });
            if (!existingBooking) {
                unique = true;
            }
        }
    }

    next();
}

module.exports = {
    generateCode,
    preSave,
};
