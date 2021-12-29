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
      instagramUrl: 'url1',
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
        expect(res.body.user.OwnedBots[0].instagramUrl).toEqual('url1');
      });
  });
  test('POST/', async () => {
    await BotModel.findOneAndDelete(bot._id);
    await request(app)
      .post('/bot/')
      .set('x-auth-token', authToken)
      .send({
        instagramUrl: 'url1',
        username: 'abc',
        password: 'abc',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot.instagramUrl).toEqual('url1');
      });
  });

  test('PATCH/', async () => {
    await request(app)
      .patch('/bot/isActive')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
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
      .patch('/bot/credentials')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
        username: 'username',
        password: 'password',
      })
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('DELETE/', async () => {
    await request(app)
      .delete('/bot')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(async (res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.instagramUrl).toEqual('url1');
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
      .get('/bot/reply')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
        pageNum: 1,
        pageSize: 10,
      })
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
      .post('/bot/reply')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
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
      .patch('/bot/reply')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
        replyId: reply._id,
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
      .patch('/bot/reply/isActive')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
        replyId: reply._id,
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
      .delete('/bot/reply')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
        replyId: reply._id,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.reply.answer).toEqual('answer');
        expect(res.body.reply.keywords).toEqual(['keyword1', 'keyword2']);
      });
  });
  test('PUT/default-reply', async () => {
    await request(app)
      .put('/bot/default-reply')
      .set('x-auth-token', authToken)
      .send({
        botId: bot._id,
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
      .patch('/bot/invite-moderator')
      .set('x-auth-token', authToken)
      .send({
        userToInviteId: userToInvite._id,
        botId: bot._id,
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
      .patch('/bot/remove-moderator')
      .set('x-auth-token', authToken)
      .send({
        userToRemoveId: userToInvite._id,
        botId: bot._id,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.bot._id).toEqual(bot._id.toString());
        expect(res.body.bot.userModerators).toEqual([]);
      });
  });
});
