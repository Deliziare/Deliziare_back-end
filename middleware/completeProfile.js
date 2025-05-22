import Chef from "../Models/chefModel"

export const completeProfile=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const chef=Chef.find({userId})
        if(!chef.isProfileCompleted){
            return res.status(401).json({message:"complete your profile",isProfileCompleted:false})
        }
        next()
    } catch (error) {
        return res.status(500).json({message:error})
    }
}