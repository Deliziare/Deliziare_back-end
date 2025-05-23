import mongoose from "mongoose"

const chefPostSchema = new mongoose.Schema(
  {
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {         
      type: String,
      required: true,
      trim: true,
    },
    description: {   
      type: String,
      
    },
    images: [         
      {
        url: { type: String, required: true },
        altText: { type: String }, 
      }
    ],
  
    tags: [String],           
    createdAt: {
      type: Date,
      default: Date.now,
    },
   
  },
  { timestamps: true }
);

  const ChefPost = mongoose.model('ChefPost', chefPostSchema);
  export default ChefPost;