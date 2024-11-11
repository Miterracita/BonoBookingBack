
//generar string aleatorio de 5 caracteres
function generateCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function preSave(next) {
    if (!this.code) {
        let unique = false;
        while (!unique) {
            this.code = generateCode();
            const existingBono = await mongoose.models.Bono.findOne({ code: this.code });
            if (!existingBono) {
                unique = true;
            }
        }
    }

    //le añado el código generado automáticamente al nombre para evitar problemas de duplicidad en el name
    if (this.name) {
        this.name = `Bono ${this.type} - ${this.code}`;
    }
    
    // Asignar totalUses directamente desde type, a su vez, al crear un nuevo bono, el totalUses y el availableUses serán el mismo
    if (this.isNew) {
        this.totalUses = this.type;
        this.availableUses = this.totalUses;
    }

    next();
}

function preUpdate(next) {
    const update = this.getUpdate();
    if (update.totalUses !== undefined && update.availableUses !== undefined) {
        if (update.totalUses === update.availableUses) {
            update.active = false;
        }
    }
    next();
}

module.exports = {
    generateCode,
    preSave,
    preUpdate
};
