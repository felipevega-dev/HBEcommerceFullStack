import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true 
    },
    subcategories: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CategoryModel = mongoose.models.category || mongoose.model('category', categorySchema);

export default CategoryModel; 