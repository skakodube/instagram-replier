/**
 * Tests Bot route
 *
 * @group integration/routes/bot
 */

const request = require('supertest');
const app = require('../../src/app');
const BotModel = require('../../src/api/models/bot');
const UserModel = require('../../src/api/models/user');
const ReplyModel = require('../../src/api/models/reply');
const jwtHelper = require('../../src/api/helpers/jwt');

describe('/bot', () => {
  let user, bot, userToInvite, authToken;
  beforeAll(async () => {
    user = new UserModel({
      firstName: 'Mark',
      lastName: 'Watney',
      email: 'markwatney@email.com',
      password: '12345',
      isVerified: true,
    });
    user.password = '12345';
    await user.save();

    userToInvite = new UserModel({
      firstName: 'Anna',
      lastName: 'Doe',
      email: 'annadoe@email.com',
      password: '12345',
      isVerified: true,
    });
    userToInvite.password = '12345';
    await userToInvite.save();

    authToken = jwtHelper.generateJWT(user);
  });
  beforeEach(async () => {
    bot = new BotModel({
      userCreated: user._id,
      credentials: {
        username: 'abc',
        password: 'abc',
      },
    });
    user.OwnedBots.push(bot._id);
    await user.save();
    await bot.save();
  });
  afterEach(async () => {
    user.OwnedBots.pull(bot._id);
    await user.save();
    await BotModel.deleteMany({});
    await ReplyModel.deleteMany({});
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
  });
  test('GET/', async () => {
    await request(app)
      .get('/bot/')
      .set('x-auth-token', authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user._id).toEqual(user._id.toString());
        expect(res.body.user.OwnedBots[0].credentials.username).toEqual('abc');
      });
  });
  test('POST/', async () => {
    await BotModel.findOneAndDelete(bot._id);
    await request(app)
      .post('/bot/')
      .set('x-auth-token', authToken)
      .send({
        username: 'abc',
        password: 'abc',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot.credentials.username).toEqual('abc');
      });
  });

  test('PATCH/', async () => {
    await request(app)
      .patch(`/bot/${bot._id}/isActive`)
      .set('x-auth-token', authToken)
      .send({
        isActive: false,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot.isActive).toEqual(false);
      });
  });

  test('PATCH/', async () => {
    await request(app)
      .patch(`/bot/${bot._id}/credentials`)
      .set('x-auth-token', authToken)
      .send({
        username: 'username',
        password: 'password',
      })
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('DELETE/', async () => {
    await request(app)
      .delete(`/bot/${bot._id}`)
      .set('x-auth-token', authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(async (res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.credentials.username).toEqual('abc');
      });
  });
  test('GET/reply', async () => {
    const reply = new ReplyModel({
      botBelongs: bot._id,
      keywords: ['keyword1', 'keyword2'],
      answer: 'answer',
    });

    bot.replies.push(reply._id);

    await bot.save();
    await reply.save();

    await request(app)
      .get(`/bot/${bot._id}/reply`)
      .query({ pageNum: 1, pageSize: 10 })
      .set('x-auth-token', authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.replies[0].answer).toEqual(reply.answer);
        expect(res.body.bot.replies[0].keywords).toEqual(reply.keywords);
      });
  });
  test('POST/reply', async () => {
    await request(app)
      .post(`/bot/${bot._id}/reply`)
      .set('x-auth-token', authToken)
      .send({
        keywords: ['keyword1', 'keyword2'],
        answer: 'answer',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.reply.answer).toEqual('answer');
        expect(res.body.reply.keywords).toEqual(['keyword1', 'keyword2']);
      });
  });
  test('PATCH/reply', async () => {
    const reply = new ReplyModel({
      botBelongs: bot._id,
      keywords: ['keyword1', 'keyword2'],
      answer: 'answer',
    });

    bot.replies.push(reply._id);

    await bot.save();
    await reply.save();

    await request(app)
      .patch(`/bot/${bot._id}/reply/${reply._id}`)
      .set('x-auth-token', authToken)
      .send({
        keywords: ['new keyword1', 'new keyword2'],
        answer: 'new answer',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.reply.answer).toEqual('new answer');
        expect(res.body.reply.keywords).toEqual([
          'new keyword1',
          'new keyword2',
        ]);
      });
  });

  test('PATCH/reply/isActive', async () => {
    const isActive = false;

    const reply = new ReplyModel({
      botBelongs: bot._id,
      keywords: ['keyword1', 'keyword2'],
      answer: 'answer',
      isActive: true,
    });

    bot.replies.push(reply._id);

    await bot.save();
    await reply.save();

    await request(app)
      .patch(`/bot/${bot._id}/reply/${reply._id}/isActive`)
      .set('x-auth-token', authToken)
      .send({
        isActive: isActive,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.reply.isActive).toEqual(isActive);
      });
  });
  test('DELELE/reply', async () => {
    const reply = new ReplyModel({
      botBelongs: bot._id,
      keywords: ['keyword1', 'keyword2'],
      answer: 'answer',
    });

    bot.replies.push(reply._id);

    await bot.save();
    await reply.save();

    await request(app)
      .delete(`/bot/${bot._id}/reply/${reply._id}`)
      .set('x-auth-token', authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.reply.answer).toEqual('answer');
        expect(res.body.reply.keywords).toEqual(['keyword1', 'keyword2']);
      });
  });
  test('PATCH/default-reply', async () => {
    await request(app)
      .patch(`/bot/${bot._id}/default-reply`)
      .set('x-auth-token', authToken)
      .send({
        defaultReply: 'hello',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot.defaultReply).toEqual('hello');
      });
  });

  test('PATCH/invite-moderator', async () => {
    await request(app)
      .patch(`/bot/${bot._id}/invite-moderator`)
      .set('x-auth-token', authToken)
      .send({
        userToInviteEmail: userToInvite.email,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.userModerators[0]).toEqual(
          userToInvite._id.toString()
        );
      });
  });
  test('PATCH/remove-moderator', async () => {
    bot.userModerators.push(userToInvite._id);
    userToInvite.InvitedBots.push(bot._id);

    await userToInvite.save();
    await bot.save();

    await request(app)
      .patch(`/bot/${bot._id}/remove-moderator`)
      .set('x-auth-token', authToken)
      .send({
        userToRemoveId: userToInvite._id,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.userModerators).toEqual([]);
      });
  });
});
