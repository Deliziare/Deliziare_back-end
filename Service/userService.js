import User from '../Models/userModel.js';
import Chef from '../Models/chefModel.js';
import DeliveryBoy from '../Models/deliveryboyModel.js';
import bcrypt from 'bcryptjs';

export const registerUser = async ({ name, email, password, phone, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
  });

  return await user.save();
};



export const registerHost = async ({ name, email, password, phone }) => {
  const user = await registerUser({ name, email, password, phone, role: 'host' });
  return { user };
};

export const registerChef = async ({ name, email, password,  experience, specialize,locationLat,locationLng, certificate }) => {
  const user = await registerUser({ name, email, password, role: 'chef' });

  const chef = new Chef({
    userId: user._id,
    location: {
        lat: Number(locationLat),
        lng: Number(locationLng),
    },
    experience,
    specialize,
    certificate,
  });

  await chef.save();
  return { user, chef };
};

export const registerDeliveryBoy = async ({ name, email, password, vehicleType, license, IDProof }) => {
  const user = await registerUser({ name, email, password, role: 'deliveryBoy' });

  const deliveryBoy = new DeliveryBoy({
    userId: user._id,
    vehicleType,
    license,
    IDProof,
  });

  await deliveryBoy.save();
  return { user, deliveryBoy };
};

export const isEmailRegistered = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  const existingUser = await User.findOne({ email });
  return !!existingUser;
};

