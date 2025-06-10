import mongoose from 'mongoose'

const deliverySchema=new mongoose.Schema({
    deliveryBoyId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    bidId:{type:mongoose.Schema.Types.ObjectId,ref:'Bid',required:true},
    status:{
        type:String,
        enum:['pending','picked up','delivered'],
        default:'pending'
    },

})

const Delivery=mongoose.model('Delivery',deliverySchema)

export default Delivery;