import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true, versionKey: false });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;