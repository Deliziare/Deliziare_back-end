// import { oauth2client } from '../config/google.js';
// import User from '../Models/userModel.js';
// import axios from 'axios';
// import { generateAccessToken,generateRefreshToken } from '../utils/generateToken.js';


// export const googleAuthService = async (code) => {
//   if (!code) throw new Error('Authorization code not provided');

  
//   const googleRes = await oauth2client.getToken(code);
//   oauth2client.setCredentials(googleRes.tokens);


//   const userRes = await axios.get(
//     `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleRes.tokens.access_token}`
//   );

//   const { email, name, picture } = userRes.data;
//   console.log(userRes.data)

//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({
//       name,
//       email,
//       profilePic: picture,
//       isGoogleUser:true,
//       isVerified: true,
//     });
//   }


//   const accessToken = generateAccessToken(user);
//   const refreshToken = generateRefreshToken(user);

  

//   return {
//     user,
//     accessToken,
//     refreshToken,
//   };
// };
