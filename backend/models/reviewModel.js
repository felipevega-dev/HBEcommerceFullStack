import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxLength: 500
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Un usuario solo puede dejar una review por producto
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const reviewModel = mongoose.model('review', reviewSchema);

export default reviewModel; 