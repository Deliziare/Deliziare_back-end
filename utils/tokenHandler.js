export const sendTokensAsCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd, 
    sameSite: isProd ? 'None' : 'Lax', 
    maxAge: 15 * 60 * 1000,
    path:'/'
  });
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path:'/'
  });
  
  };