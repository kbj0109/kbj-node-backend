// 공통 쿠키 옵션
exports.globalCookieOptions = (() => {
  if (process.env.NODE_ENV === 'production') {
    return {
      sameSite: 'none',
      secure: true,
      domain: process.env.COOKIE_SHARE_DOMAIN,
    };
  }
  if (process.env.COOKIE_SHARE_DOMAIN !== undefined) {
    return {
      ...(process.env.COOKIE_SHARE_DOMAIN !== 'localhost' && {
        domain: process.env.COOKIE_SHARE_DOMAIN,
      }),
    };
  }
  return {};
})();
