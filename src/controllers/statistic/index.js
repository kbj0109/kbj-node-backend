const { wrapAsync } = require('../../utils');
const { db } = require('../../database/models');
const { globalCookieOptions } = require('../../config/optionConfig');
const { getRandomDigits } = require('../../utils');

const clientCookieOption = {
  ...globalCookieOptions,
  httpOnly: true,
  maxAge: 1000 * 60 * 30,
};

const visitCookieOption = {
  ...globalCookieOptions,
  httpOnly: true,
  maxAge: 1000 * 60 * 30,
};

exports.visitPage = wrapAsync(async (req, res) => {
  const origin = req.headers.origin.replace(/(^\w+:|^)\/\//, '');
  // const referer = req.headers.referer.replace(/(^\w+:|^)\/\//, '');
  const { location } = req.body; // 목적지
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const now = Date.now();
  const {
    _kbj_client: clientCookie = '',
    _kbj_visit: visitCookie = '',
  } = req.cookies;

  // 쿠키 유무 & 유효성 확인
  const { clientId, visitId, isNewVisit } = (() => {
    const idLength = 7;

    try {
      const [, clientId] = clientCookie.split('.');
      const [, clientIdOnVisit, visitId] = visitCookie.split('.');

      const validClientId = !!(
        clientId.length === idLength && Number.isNaN(Number(clientId)) === false
      );
      const validVisitId =
        clientId === clientIdOnVisit &&
        !!(
          visitId.length === idLength && Number.isNaN(Number(visitId)) === false
        );

      return {
        clientId: validClientId ? clientId : getRandomDigits({ length: 7 }),
        visitId: validVisitId ? visitId : getRandomDigits({ length: 7 }),
        isNewVisit: validVisitId === false,
      };
    } catch (err) {
      return {
        clientId: getRandomDigits({ length: idLength }),
        visitId: getRandomDigits({ length: idLength }),
        isNewVisit: true,
      };
    }
  })();

  // 이전 방문 기록 검색 후 현재 방문에 referer로 저장
  const item = isNewVisit
    ? undefined
    : await db.VisitLog.findOne({
        where: { id: `${clientId}.${visitId}` },
        order: [['idx', 'DESC']],
      });

  await db.VisitLog.create({
    id: `${clientId}.${visitId}`,
    origin,
    referer: item ? item.url : '/',
    url: location,
    ip,
    userAgent,
    visitedAt: now,
  });

  // 쿠키 갱신
  res.cookie('_kbj_client', `KBJ.${clientId}`, clientCookieOption);
  res.cookie('_kbj_visit', `KBJ.${clientId}.${visitId}`, visitCookieOption);

  res.end();
});
