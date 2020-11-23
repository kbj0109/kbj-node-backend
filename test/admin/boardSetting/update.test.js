const chalk = require('chalk');
const path = require('path');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/boardSetting');
const {
  getBoardSettingObject,
} = require('../../../src/services/boardSetting/common');
const { db } = require('../../../src/database/models');
const { getRandomToken } = require('../../../src/utils');
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

const newBoardSetting = {
  type: '수정된 temp',
  subject: '수정된 temp 설명 내용',
  createAuth: 'writer,level',
  createLevel: 100,
  readListAuth: 'writer,level',
  readListLevel: 100,
  readAuth: 'writer,level',
  readLevel: 100,
  updateAuth: 'writer,level',
  updateLevel: 100,
  deleteAuth: 'writer,level',
  deleteLevel: 100,
  noticeLevel: 100,
  orderLevel: 100,
  visibleAuth: 'writer,level',
  visibleLevel: 100,
  likeAuth: 'writer,level',
  likeLevel: 100,
  useComment: false,
  commentCreateAuth: 'writer,level',
  commentCreateLevel: 100,
  commentReadListAuth: 'writer,level',
  commentReadListLevel: 100,
  commentDeleteAuth: 'writer,level',
  commentDeleteLevel: 100,
  commentLikeAuth: 'writer,level',
  commentLikeLevel: 100,
  fileCreateAuth: 'writer,level',
  fileCreateLevel: 100,
  fileReadAuth: 'writer,level',
  fileReadLevel: 100,
  attachImageSize: 1024 * 1024 * 1024 * 5,
  attachFileSize: 1024 * 1024 * 1024 * 5,
  attachFileSizeTotal: 1024 * 1024 * 1024 * 10,
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

describe(chalk.bold.cyan('관리자/게시판 수정'), () => {
  let response;

  beforeAll(async () => {
    await login(request, 'admin', 'admin');
    const postRes = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);

    response = await request
      .put(`/admin/board-settings/${postRes.body.id}`)
      .send(newBoardSetting);
  });

  describe(`PUT /admin/board-settings/{boardId}
      (userId: admin)`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      boardProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`성공] 수정시간과 수정자 아이디가 기록됨`, async () => {
      expect(response.body.updater).toBe('admin');
      expect(response.body.updatedAt).not.toBeFalsy();
    });
  });

  test(`실패] 존재하는 게시판 type 이름으로 수정 불가`, async () => {
    const [postRes1, postRes2] = await Promise.all([
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, type: getRandomToken() }),
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, type: getRandomToken() }),
    ]);

    const putRes = await request
      .put(`/admin/board-settings/${postRes1.body.id}`)
      .send({ ...mockBoardSetting, type: postRes2.body.type });

    expect(putRes.statusCode).toBe(400);
  });

  test(`실패] 유효하지 않은 Board 속성값`, async () => {
    const postRes = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);

    const [res1, res2, res3, res4] = await Promise.all([
      request
        .put(`/admin/board-settings/${postRes.body.id}`)
        .send({ ...mockBoardSetting, type: ' ' }),
      request
        .put(`/admin/board-settings/${postRes.body.id}`)
        .send({ ...mockBoardSetting, subject: ' ' }),
      request
        .put(`/admin/board-settings/${postRes.body.id}`)
        .send({ ...mockBoardSetting, createAuth: 0 }),
      request
        .put(`/admin/board-settings/${postRes.body.id}`)
        .send({ ...mockBoardSetting, createLevel: 'abc' }),
    ]);

    expect(res1.statusCode).toBe(400);
    expect(res2.statusCode).toBe(400);
    expect(res3.statusCode).toBe(400);
    expect(res4.statusCode).toBe(400);
  });

  test('성공] 게시판 type 수정시 연관 데이터 모두 수정됨', async () => {
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

    // 테스트 시작
    expect(postBoard.statusCode).toBe(200);
    expect(postFile.statusCode).toBe(200);
    expect(postArticle.statusCode).toBe(200);
    expect(postComment.statusCode).toBe(200);
    expect(postLikeArticle.statusCode).toBe(200);
    expect(postLikeComment.statusCode).toBe(200);
    expect(postImage.statusCode).toBe(200);

    // 수정 전 데이터
    const option = { attributes: ['idx'], where: { boardType }, raw: true };

    const beforeUpdate = await Promise.all([
      db.Article.findAll(option),
      db.Tag.findAll(option),
      db.File.findAll(option),
      db.Comment.findAll(option),
      db.Like.findAll(option),
      db.Like.findAll(option),
      db.Image.findAll(option),
    ]);

    // Board Setting - type 변경
    const response = await request
      .put(`/admin/board-settings/${postBoard.body.id}`)
      .send({ ...mockBoardSetting, type: getRandomToken() });
    expect(response.statusCode).toBe(200);

    // 수정 후 데이터
    const option2 = { ...option, where: { boardType: response.body.type } };
    const afterUpdate = await Promise.all([
      db.Article.findAll(option2),
      db.Tag.findAll(option2),
      db.File.findAll(option2),
      db.Comment.findAll(option2),
      db.Like.findAll(option2),
      db.Like.findAll(option2),
      db.Image.findAll(option2),
    ]);

    beforeUpdate.forEach((dbBefore, index) => {
      const dbAfter = afterUpdate[index];
      expect(dbBefore).toEqual(dbAfter);
    });
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    const postRes = await request
      .post(`/admin/board-settings`)
      .send({ ...mockBoardSetting, type: mockBoardSetting.type + 2 });

    await login(request, 'sample', 'sample');
    const putRes = await request
      .put(`/admin/board-settings/${postRes.body.id}`)
      .send({ ...newBoardSetting, type: newBoardSetting.type + 2 });

    expect(putRes.statusCode).toBe(403);
  });
});
