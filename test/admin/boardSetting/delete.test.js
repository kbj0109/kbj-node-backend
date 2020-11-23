const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/boardSetting');
const {
  getBoardSettingObject,
} = require('../../../src/services/boardSetting/common');
const { db } = require('../../../src/database/models');
const { getDate } = require('../../../src/utils');
const { FILE_UPLOAD_PATH } = require('../../../src/config');
const { DUMMY_FILE_PATH } = require('../../config');

const boardProperties = Object.keys(getBoardSettingObject(schema));

const mockBoardSetting = {
  type: 'temp',
  subject: 'temp 설명 내용',
  createAuth: '',
  createLevel: 0,
  readListAuth: '',
  readListLevel: 0,
  readAuth: '',
  readLevel: 0,
  updateAuth: '',
  updateLevel: 0,
  deleteAuth: '',
  deleteLevel: 0,
  noticeLevel: 0,
  orderLevel: 0,
  visibleAuth: '',
  visibleLevel: 0,
  likeAuth: '',
  likeLevel: 0,
  useComment: true,
  commentCreateAuth: '',
  commentCreateLevel: 0,
  commentReadListAuth: '',
  commentReadListLevel: 0,
  commentDeleteAuth: '',
  commentDeleteLevel: 0,
  commentLikeAuth: '',
  commentLikeLevel: 0,
  fileCreateAuth: '',
  fileCreateLevel: 0,
  fileReadAuth: '',
  fileReadLevel: 0,
  attachImageSize: 1024 * 1024 * 1024,
  attachFileSize: 1024 * 1024 * 1024,
  attachFileSizeTotal: 1024 * 1024 * 1024 * 3,
};

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  category: '',
  description: '',
  // email: '',
  link: '',
  secret: false,
  field1: '',
  field2: '',
  field3: '',
  tags: '사과,배,귤,망고',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/게시판 삭제'), () => {
  let response;

  beforeAll(async () => {
    await login(request, 'admin', 'admin');
    const postRes = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);

    response = await request.delete(`/admin/board-settings/${postRes.body.id}`);
  });

  describe(`DELETE /admin/board-settings/{boardId}
      (userId: admin)`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      boardProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`성공] 삭제 시간과 삭제자 아이디 기록됨`, async () => {
      expect(response.body.deleter).toBe('admin');
      expect(response.body.deletedAt).not.toBeFalsy();
    });
  });

  test('성공] 게시판 삭제시 연관 데이터 모두 삭제됨', async () => {
    const postBoard = await request
      .post(`/admin/board-settings`)
      .send({ ...mockBoardSetting, type: mockBoardSetting.type + 1 });

    const boardType = postBoard.body.type;

    const postFile = await request
      .post(`/articles/${boardType}/file`)
      .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.jpg'));
    const postArticle = await request
      .post(`/articles/${boardType}`)
      .send({ ...mockPost, attachFiles: [postFile.body] });
    const postComment = await request
      .post(`/articles/${boardType}/${postArticle.body.id}/comments`)
      .send({ content: mockPost.content });
    const postLikeArticle = await request.post(
      `/articles/${boardType}/${postArticle.body.id}/like`,
    );
    const postLikeComment = await request.post(
      `/articles/${boardType}/comments/${postComment.body.id}/like`,
    );
    const postImage = await request
      .post(`/articles/${boardType}/img`)
      .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.jpg'));

    const response = await request.delete(
      `/admin/board-settings/${postBoard.body.id}`,
    );

    // 테스트 시작
    expect(postBoard.statusCode).toBe(200);
    expect(postFile.statusCode).toBe(200);
    expect(postArticle.statusCode).toBe(200);
    expect(postComment.statusCode).toBe(200);
    expect(postLikeArticle.statusCode).toBe(200);
    expect(postLikeComment.statusCode).toBe(200);
    expect(postImage.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);

    const where = { boardType };
    const result = await Promise.all([
      db.BoardSetting.findAll({ where: { type: boardType } }),
      db.Article.findAll({ where }),
      db.Tag.findAll({ where }),
      db.File.findAll({ where }),
      db.Comment.findAll({ where }),
      db.Like.findAll({ where }),
      db.Like.findAll({ where }),
      db.Image.findAll({ where }),
    ]);

    expect(result.filter(one => one.length === 0).length).toBe(result.length);

    // 파일 삭제 확인
    const fileList = await db.File.findAll({ where, paranoid: false });
    fileList.forEach(file => {
      const date = getDate(file.createdAt.getTime());
      const filePath = path.join(FILE_UPLOAD_PATH, date, file.id);

      expect(fs.existsSync(filePath)).toBe(false);
    });
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    const postRes = await request
      .post(`/admin/board-settings`)
      .send({ ...mockBoardSetting, type: mockBoardSetting.type + 2 });

    await login(request, 'sample', 'sample');
    const putRes = await request.delete(
      `/admin/board-settings/${postRes.body.id}`,
    );

    expect(putRes.statusCode).toBe(403);
  });
});
