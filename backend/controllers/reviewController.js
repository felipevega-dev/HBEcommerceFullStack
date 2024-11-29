import reviewModel from '../models/reviewModel.js';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';

// Crear una review
const createReview = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Verificar si el usuario ya ha revisado este producto
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Ya has revisado este producto'
            });
        }

        // Crear la review
        const review = new reviewModel({
            userId,
            productId,
            rating,
            comment
        });

        await review.save({ session });

        // Actualizar el rating promedio del producto
        const reviews = await reviewModel.find({ productId });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, rating);
        const averageRating = totalRating / (reviews.length + 1);

        await productModel.findByIdAndUpdate(
            productId,
            {
                $set: {
                    'rating.average': averageRating,
                    'rating.count': reviews.length + 1
                }
            },
            { session }
        );

        await session.commitTransaction();

        // Poblar la review con los datos del usuario
        const populatedReview = await reviewModel.findById(review._id)
            .populate('userId', 'name profileImage');

        res.json({
            success: true,
            message: 'Review creada exitosamente',
            review: populatedReview
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error al crear review:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

// Obtener reviews de un producto
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const reviews = await reviewModel.find({ productId })
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await reviewModel.countDocuments({ productId });

        res.json({
            success: true,
            reviews,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasMore: skip + reviews.length < total
            }
        });

    } catch (error) {
        console.error('Error al obtener reviews:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export { createReview, getProductReviews }; 