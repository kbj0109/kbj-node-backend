const bcryptjs = require('bcryptjs');
const { uuid } = require('../../utils');
const { db } = require('.');

const createMember = async data => {
  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(data.password, salt);

  await db.User.upsert({
    ...data,
    password: hash.substr(salt.length),
    salt,
  });
};

const createBoard = async data => {
  const board = await db.BoardSetting.findOne({ where: { type: data.type } });

  await db.BoardSetting.upsert({
    id: board ? board.id : uuid(),
    ...data,
  });
};

module.exports = async () => {
  try {
    await Promise.all([
      // sample 계정 생성
      createMember({
        userId: 'sample',
        password: 'sample',
        name: '샘플맨',
        email: 'sample@sample.com',
      }),
      createMember({
        userId: 'sample2',
        password: 'sample2',
        name: '샘플맨2',
        role: 'SPECIAL',
        email: 'sample2@sample2.com',
      }),
      // admin 계정 생성
      createMember({
        userId: 'admin',
        password: 'admin',
        name: '관리자',
        level: 100,
        email: 'admin@admin.com',
      }),
      createMember({
        userId: 'admin2',
        password: 'admin2',
        name: '관리자2',
        role: 'SUB_ADMIN',
        email: 'admin2@admin2.com',
      }),

      // default 게시판 생성
      createBoard({
        type: 'default',
        subject: '자유 게시판',
        createAuth: 'level',
        createLevel: 0,
        createRole: '',
        readListAuth: '',
        readListLevel: 0,
        readAuth: '',
        readLevel: 0,
        updateAuth: 'level,writer,role',
        updateLevel: 100,
        updateRole: 'SPECIAL',
        deleteAuth: 'level,writer,role',
        deleteLevel: 100,
        deleteRole: 'SPECIAL',
        likeAuth: 'level',
        likeLevel: 0,
        useComment: true,
        commentCreateAuth: 'level',
        commentCreateLevel: 0,
        commentReadListAuth: '',
        commentReadListLevel: 0,
        commentDeleteAuth: 'level,writer,role',
        commentDeleteLevel: 100,
        commentDeleteRole: 'SPECIAL',
        commentLikeAuth: 'level',
        commentLikeLevel: 0,
        fileCreateAuth: 'level',
        fileCreateLevel: 0,
        fileReadAuth: '',
        fileReadLevel: 0,
        attachFileSize: 1024 * 1024 * 5,
        attachFileSizeTotal: 1024 * 1024 * 20,
        attachImageSize: 1024 * 1024 * 10,
      }),
      // private 게시판 생성
      createBoard({
        type: 'private',
        subject: '회원 전용 게시판',
        createAuth: 'level',
        createLevel: 0,
        createRole: '',
        readListAuth: 'level',
        readListLevel: 0,
        readListRole: '',
        readAuth: 'level',
        readLevel: 0,
        readRole: '',
        updateAuth: 'writer,level',
        updateLevel: 100,
        updateRole: '',
        deleteAuth: 'writer,level',
        deleteLevel: 100,
        deleteRole: '',
        likeAuth: 'level',
        likeLevel: 0,
        likeRole: '',
        useComment: true,
        commentCreateAuth: 'level',
        commentCreateLevel: 0,
        commentCreateRole: '',
        commentReadListAuth: 'level',
        commentReadListLevel: 0,
        commentReadListRole: '',
        commentDeleteAuth: 'writer,level',
        commentDeleteLevel: 100,
        commentDeleteRole: '',
        commentLikeAuth: 'level',
        commentLikeLevel: 0,
        commentLikeRole: '',
        fileCreateAuth: 'level',
        fileCreateLevel: 0,
        fileCreateRole: '',
        fileReadAuth: 'level',
        fileReadLevel: 0,
        fileReadRole: '',
        attachFileSize: 1024 * 1024 * 30,
        attachFileSizeTotal: 1024 * 1024 * 200,
        attachImageSize: 1024 * 1024 * 10,
      }),
      // public 게시판 생성
      createBoard({
        type: 'public',
        subject: '비회원 게시판',
        createAuth: '',
        createLevel: 0,
        createRole: '',
        readListAuth: '',
        readListLevel: 0,
        readListRole: '',
        readAuth: '',
        readLevel: 0,
        readRole: '',
        updateAuth: 'writer,level',
        updateLevel: 100,
        updateRole: '',
        deleteAuth: 'writer,level',
        deleteLevel: 100,
        deleteRole: '',
        likeAuth: '',
        likeLevel: 0,
        likeRole: '',
        useComment: true,
        commentCreateAuth: '',
        commentCreateLevel: 0,
        commentCreateRole: '',
        commentReadListAuth: '',
        commentReadListLevel: 0,
        commentReadListRole: '',
        commentDeleteAuth: 'writer,level',
        commentDeleteLevel: 100,
        commentDeleteRole: '',
        commentLikeAuth: '',
        commentLikeLevel: 0,
        commentLikeRole: '',
        fileCreateAuth: '',
        fileCreateLevel: 0,
        fileCreateRole: '',
        fileReadAuth: '',
        fileReadLevel: 0,
        fileReadRole: '',
        attachFileSize: 1024 * 1024 * 5,
        attachFileSizeTotal: 1024 * 1024 * 20,
        attachImageSize: 1024 * 1024 * 10,
      }),
    ]);
  } catch (err) {
    console.log(err);
  }
};
