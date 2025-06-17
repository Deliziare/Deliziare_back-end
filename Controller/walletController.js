
import Bid from '../Models/bidModel.js';
import Payment from '../Models/paymentModel.js';
import Withdrawal from '../Models/withdrawalModel.js';
import { debitWallet, getWallet } from "../Service/walletService.js";
import Wallet from '../Models/walletModel.js'

export const requestChefWithdrawal = async (req, res) => {
  try {
    const chefId = req.user.id;
    const { amount } = req.body;

    
     const payments = await Payment.find().populate({
      path: 'bid.bidId',
      select: 'chefId',
    });

    const userPayments = payments.filter(
      (p) => p.bid.bidId?.chefId?.toString() === chefId
    );

    const totalEarning = userPayments.reduce((acc, curr) => acc + curr.amount, 0);
    console.log(totalEarning)

    const withdrawals = await Withdrawal.find({ userId: chefId, role: 'chef', status: 'pending' });
    const withdrawn = withdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    const availableBalance = totalEarning - withdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const newRequest = new Withdrawal({
      userId: chefId,
      role: 'chef',
      amount
    });

    await newRequest.save();

    res.status(201).json({ message: 'Chef withdrawal request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting withdrawal', error: error.message });
  }
};

export const requestDeliveryWithdrawal = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const { amount } = req.body;

    const payments = await Payment.find().populate({
      path: 'bid.bidId',
      select: 'deliveryBoyId',
    });

    
    const userPayments = payments.filter(
      (p) => p.bid.bidId?.deliveryBoyId?.toString() === deliveryBoyId
    );

  
    const totalEarning = userPayments.reduce((acc, curr) => acc + curr.deliveryCharge, 0);
    console.log(totalEarning)
    
    const withdrawals = await Withdrawal.find({ userId: deliveryBoyId, role: 'deliveryBoy', status: 'pending' });
    const withdrawn = withdrawals.reduce((acc, curr) => acc + curr.amount, 0);

    const availableBalance = totalEarning - withdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const newRequest = new Withdrawal({
      userId: deliveryBoyId,
      role: 'deliveryBoy',
      amount,
    });

    await newRequest.save();

   
    res.status(201).json({ message: 'DeliveryBoy withdrawal request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting withdrawal', error: error.message });
  }
};



export const approveWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const withdrawal = await Withdrawal.findById(requestId);
   const walletUser=await Wallet.findOne({userId:withdrawal.userId})

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status === 'approved') {
      return res.status(400).json({ message: 'Request already approved' });
    }

    if(walletUser.balance>withdrawal.amount){
      withdrawal.status = 'approved';
    }

    await withdrawal.save();

     await debitWallet(
      withdrawal.userId,
      withdrawal.role,
      withdrawal.amount,
      'amount withdrawal'
    )

    res.status(200).json({ message: 'Withdrawal request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
    console.log(error)
  }
};


export const getWalletByChefIdController = async (req, res) => {
  try {
    const chefId = req.user.id;
    const wallet = await getWallet(chefId, 'chef');
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Error getting wallet", error: error.message });
  }
};

export const getWalletByDeliveryIdController = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const role = 'deliveryBoy'; // Explicitly set the role
    
    console.log('Fetching wallet for:', { deliveryBoyId, role });
    
    const wallet = await getWallet(deliveryBoyId, role);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ 
      message: "Error getting wallet", 
      error: error.message 
    });
  }
};


export const getAllWithdrawRequest=async(req,res)=>{
  try {
    const withdrawals=await Withdrawal.find().populate('userId')

    const walletUser = await Wallet.findOne({ userId: withdrawals.userId });
    if (!walletUser) {
      return res.status(404).json({ message: 'User wallet not found' });
    }
    res.status(200).json({message:'fetched all withdrawals',withdrawals,walletUser})
  } catch (error) {
    console.log('withdraw error',error)
    res.status(500).json({message:'fetch error' ,
      error
    })
  }
}
