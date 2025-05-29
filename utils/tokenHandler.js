export const sendTokensAsCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,         
    sameSite: isProd ? 'None' : 'Lax',  
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    path: '/',
    maxAge: 15 * 60 * 1000, 
  });
};
