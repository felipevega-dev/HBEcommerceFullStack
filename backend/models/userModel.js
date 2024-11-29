import mongoose from 'mongoose';

const billingInfoSchema = {
    firstname: String,
    lastname: String,
    phone: String,
    street: String,
    city: String,
    region: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
};

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profileImage: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=random'
    },
    cartData: {type: Object, default: {}},
    billingAddresses: {
        type: [billingInfoSchema],
        default: [],
        validate: [arrayLimit, 'Excede el límite de 2 direcciones']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {minimize: false});

function arrayLimit(val) {
    return val.length <= 2;
}

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;

