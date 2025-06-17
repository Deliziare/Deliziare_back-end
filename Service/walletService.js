// // Service/walletService.js
// import Wallet from "../Models/walletModel.js";

import Wallet from "../Models/walletModel.js";


// export const getWalletByChefId = async (chefId) => {
//   let wallet = await Wallet.findOne({ chefId });
//   if (!wallet) {
//     wallet = new Wallet({ chefId, balance: 0, transactions: [] });
//     await wallet.save();
//   }
//   return wallet;
// };

// export const creditWallet = async (chefId, amount, reason = 'Order completed') => {
//   const wallet = await getWalletByChefId(chefId);
//   wallet.balance += amount;
//   wallet.transactions.push({ type: 'credit', amount, reason });
//   return await wallet.save();
// };

// export const requestWithdrawal = async (chefId, amount) => {
//   const wallet = await getWalletByChefId(chefId);
//   if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
//   wallet.balance -= amount;
//   wallet.transactions.push({ type: 'debit', amount, reason: 'Withdrawal requested' });
//   return await wallet.save();
// };




export const getWallet = async (userId, role) => {
  console.log('userId',userId)
  console.log('role',role)
  let wallet = await Wallet.findOne({ userId, role });
  if (!wallet) {
    wallet = new Wallet({ userId, role, balance: 0, transactions: [] });
    await wallet.save();
  }
  return wallet;
};

export const creditWallet = async (userId, role, amount, reason = 'Order completed') => {
  const wallet = await getWallet(userId, role);
  console.log(`Crediting wallet of ${role} (${userId}) by ₹${amount} - Reason: ${reason}`);

  wallet.balance += amount;
  wallet.transactions.push({ type: 'credit', amount, reason });

  const saved = await wallet.save();
  console.log("Wallet saved successfully:", saved);
  return saved;
};


export const debitWallet = async (userId, role, amount, reason = 'Withdrawal requested') => {
  const wallet = await getWallet(userId, role);
  if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
  wallet.balance -= amount;
  wallet.transactions.push({ type: 'debit', amount, reason });
  return await wallet.save();
};
