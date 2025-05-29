// Service/walletService.js
import Wallet from "../Models/walletModel.js";

export const getWalletByChefId = async (chefId) => {
  let wallet = await Wallet.findOne({ chefId });
  if (!wallet) {
    wallet = new Wallet({ chefId, balance: 0, transactions: [] });
    await wallet.save();
  }
  return wallet;
};

export const creditWallet = async (chefId, amount, reason = 'Order completed') => {
  const wallet = await getWalletByChefId(chefId);
  wallet.balance += amount;
  wallet.transactions.push({ type: 'credit', amount, reason });
  return await wallet.save();
};

export const requestWithdrawal = async (chefId, amount) => {
  const wallet = await getWalletByChefId(chefId);
  if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
  wallet.balance -= amount;
  wallet.transactions.push({ type: 'debit', amount, reason: 'Withdrawal requested' });
  return await wallet.save();
};
