const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/contact');
const { getContactObject } = require('../../../src/services/contact');
const { db } = require('../../../src/database/models');
const { getDate } = require('../../../src/utils');
const { FILE_UPLOAD_PATH } = require('../../../src/config');
const { DUMMY_FILE_PATH } = require('../../config');

const contactProperties = Object.keys(getContactObject(schema));

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  name: 'guest',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/문의 단일삭제'), () => {
  describe(`DELETE /admin/contact/{contactId}`, () => {
    let response;

    beforeAll(async () => {
      const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

      const fileRes = await request
        .post(`/contact/file`)
        .attach('file', filePath);
      const postRes = await request
        .post(`/contact`)
        .send({ ...mockPost, attachFiles: [fileRes.body] });

      await login(request, 'admin', 'admin');
      await request
        .post(`/admin/contact/${postRes.body.id}/reply`)
        .send({ content: mockPost.content });

      response = await request.delete(`/admin/contact/${postRes.body.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      contactProperties.forEach(prop => {
        expect(response.body[0]).toHaveProperty(prop);
      });
    });

    test(`성공] 삭제 시간과 삭제자 아이디가 기록됨`, () => {
      expect(response.body[0].deleter).toBe('admin');
      expect(response.body[0].deletedAt).not.toBeFalsy();
    });

    test('성공] Contact 삭제시 연관 데이터 모두 삭제됨', async () => {
      const contactId = response.body[0].id;
      const result = await Promise.all([
        db.Contact.findOne({ where: { id: contactId } }),
        db.File.findOne({ where: { postId: contactId } }),
        db.Reply.findOne({ where: { postId: contactId } }),
      ]);

      expect(result.filter(one => one === null).length).toBe(result.length);

      // 파일 삭제 확인
      const fileList = await db.File.findAll({
        where: { postId: contactId },
        paranoid: false,
      });
      fileList.forEach(file => {
        const date = getDate(file.createdAt.getTime());
        const filePath = path.join(FILE_UPLOAD_PATH, date, file.id);

        expect(fs.existsSync(filePath)).toBe(false);
      });
    });
  });
});

describe(chalk.bold.cyan('관리자/문의 다중삭제'), () => {
  describe(`DELETE /admin/contact/{contactId,contactId}`, () => {
    let response;

    beforeAll(async () => {
      const postRes1 = await request.post(`/contact`).send(mockPost);
      const postRes2 = await request.post(`/contact`).send(mockPost);

      response = await request.delete(
        `/admin/contact/${postRes1.body.id},${postRes2.body.id}`,
      );
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      response.body.forEach(item => {
        contactProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });

    test(`성공] 삭제 시간과 삭제자 아이디가 기록됨`, () => {
      response.body.forEach(item => {
        expect(item.deleter).toBe('admin');
        expect(item.deletedAt).not.toBeFalsy();
      });
    });
  });
});
