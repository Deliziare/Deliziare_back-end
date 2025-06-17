import chatRequestModel from "../Models/chatRequestModel.js";
import Message from "../Models/messageModel.js";

export const sendMessageService=async({senderId,receiverId,content,validPostId,requstMessage})=>{
        const newMessage = new Message({
          senderId,
          receiverId,
          content:content|| null,
          postId: validPostId|| null,
          requstId:requstMessage?._id|| null
        });
    
        const savedMessage = await newMessage.save();
    
        const messages = await savedMessage.populate([
    { path: 'postId', select: 'title images' },
    { path: 'requstId' }
  ]);
        return messages
        
}

export const saveRequstMessage=async({RequestChef,senderId, receiverId})=>{
        const { description, amount } =RequestChef
          if ( !description || !amount) {
           return 
         }
          const newRequest = new chatRequestModel({
            chefId:senderId,
            userId:receiverId,
            description,
            amount,
           });
           await newRequest.save()
           return newRequest
}
export const rejectRequstMessageService=async({chatRequstId})=>{
       const updated = await chatRequestModel.findByIdAndUpdate(
      chatRequstId,
      { status:'rejected' },
      { new: true }
    );
    return updated

}