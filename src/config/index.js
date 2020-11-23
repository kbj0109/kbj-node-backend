const path = require('path');

const dataPath =
  process.env.NODE_ENV === 'test' ? '../../_data/test' : '../../_data';

/** 토큰 비밀키 */
exports.JWT_SECRET_KEY = 'ThisIsSecretKey';

/** 프로젝트의 Root 경로를 리턴 */
exports.ROOT_PATH = path.join(__dirname, '../../');

/** 파일이 첨부될 경로 */
exports.FILE_UPLOAD_PATH = path.join(__dirname, `${dataPath}/upload`);

/** 이미지 첨부될 경로 */
exports.IMAGE_UPLOAD_PATH = path.join(__dirname, `${dataPath}/img`);

/** DB 백업 저장 경로 */
exports.DATABASE_BACKUP_PATH = path.join(__dirname, `${dataPath}/db_backup`);

/** 서버 TimeZone */
exports.SERVER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

/* 공통 에러 타입 */
exports.ERROR_TYPE = {
  // 인증
  AUTH: {
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    INVAILD_TOKEN: 'INVAILD_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    NOT_EXIST_TOKEN: 'NOT_EXIST_TOKEN',
    CSRF_ERROR: 'CSRF_ERROR',
  },
  // 공통
  COM: {
    // 유효하지 않은 입력 데이터
    INVALID_INPUT: 'INVALID_INPUT',
    // 찾을 수 없음
    NOT_FOUND: 'NOT_FOUND',
    // 데이터 중복으로 인한 처리 실패
    DUPLICATE: 'DUPLICATE',
    // 허가되지 않은 권한
    FORBIDDEN: 'FORBIDDEN',
    // DB 업데이트 실패
    DB_NOT_UPDATE: 'DB_NOT_UPDATE',
    // 상정 외의 예외
    UNEXPECTED: 'UNEXPECTED_ERROR',
  },
  // 파일
  FILE: {
    // 파일 크기 초과
    LIMIT_FILE_SIZE: 'LIMIT_FILE_SIZE',
  },
};
