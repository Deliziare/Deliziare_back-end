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
    district:String,
    bio: {
      type: String,
    },
    qualifications: [String],
    socialLinks: {
      instagram: { type: String },
      youtube: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
    },
 
  }, { timestamps: true });
  
  const Chef = mongoose.model('Chef', chefSchema);
  export default Chef;
  