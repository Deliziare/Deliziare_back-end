import mongoose from "mongoose";

const chefSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    experience: String,
    specialize: [String],
    certificate: String,
  }, { timestamps: true });
  
  const Chef = mongoose.model('Chef', chefSchema);
  export default Chef;
  