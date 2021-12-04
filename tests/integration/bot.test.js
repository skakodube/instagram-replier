/**
 * Tests Bot route
 *
 * @group integration/routes/bot
 */

const request = require("supertest");
const app = require("../../src/app");
const BotModel = require("../../src/api/models/bot");
const UserModel = require("../../src/api/models/user");
const ReplyModel = require("../../src/api/models/reply");
const jwtHelper = require("../../src/api/helpers/jwt");

describe("/bot", () => {
  let user, userToInvite, authToken;
  beforeAll(async () => {
    user = new UserModel({
      firstName: "Mark",
      lastName: "Watney",
      email: "email@email.com",
      password: "12345",
      verified: true,
    });
    user.password = "12345";
    await user.save();
    userToInvite = new UserModel({
      firstName: "Anna",
      lastName: "Doe",
      email: "annadoe@email.com",
      password: "12345",
      verified: true,
    });
    userToInvite.password = "12345";
    await userToInvite.save();
    authToken = jwtHelper.generateJWT(user);
  });
  afterEach(async () => {
    await BotModel.deleteMany({});
    await ReplyModel.deleteMany({});
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
  });
  test("GET/", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });
    user.OwnedBots.push(newBotRecord._id);
    user.save();
    newBotRecord.save();

    request(app)
      .get("/bot/")
      .set("x-auth-token", authToken)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.user._id).toEqual(user._id.toString());
        expect(res.body.user.OwnedBots[0].instagramUrl).toEqual("url1");
        return done();
      });
  });
  test("POST/", (done) => {
    request(app)
      .post("/bot/")
      .set("x-auth-token", authToken)
      .send({
        instagramUrl: "url1",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.bot.instagramUrl).toEqual("url1");
        return done();
      });
  });
  test("DELETE/", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });
    user.OwnedBots.push(newBotRecord._id);
    user.save();
    newBotRecord.save();

    request(app)
      .delete("/bot/")
      .set("x-auth-token", authToken)
      .send({
        botId: newBotRecord._id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.bot._id).toEqual(newBotRecord._id.toString());
        expect(res.body.bot.instagramUrl).toEqual("url1");
        return done();
      });
  });
  test("GET/reply", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });
    const newReply = new ReplyModel({
      botBelongs: newBotRecord._id,
      keywords: ["keyword1", "keyword2"],
      answer: "answer",
    });

    user.OwnedBots.push(newBotRecord._id);
    newBotRecord.replies.push(newReply._id);

    user.save();
    newBotRecord.save();
    newReply.save();

    request(app)
      .get("/bot/reply")
      .set("x-auth-token", authToken)
      .send({
        botId: newBotRecord._id,
        pageNum: 1,
        pageSize: 10,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.bot._id).toEqual(newBotRecord._id.toString());
        expect(res.body.bot.replies[0].answer).toEqual(newReply.answer);
        expect(res.body.bot.replies[0].keywords).toEqual(newReply.keywords);
        return done();
      });
  });
  test("POST/reply", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });

    user.OwnedBots.push(newBotRecord._id);

    user.save();
    newBotRecord.save();

    request(app)
      .post("/bot/reply")
      .set("x-auth-token", authToken)
      .send({
        botId: newBotRecord._id,
        keywords: ["keyword1", "keyword2"],
        answer: "answer",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.reply.answer).toEqual("answer");
        expect(res.body.reply.keywords).toEqual(["keyword1", "keyword2"]);
        return done();
      });
  });
  test("PATCH/reply", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });
    const newReply = new ReplyModel({
      botBelongs: newBotRecord._id,
      keywords: ["keyword1", "keyword2"],
      answer: "answer",
    });

    user.OwnedBots.push(newBotRecord._id);
    newBotRecord.replies.push(newReply._id);

    user.save();
    newBotRecord.save();
    newReply.save();

    request(app)
      .patch("/bot/reply")
      .set("x-auth-token", authToken)
      .send({
        botId: newBotRecord._id,
        replyId: newReply._id,
        keywords: ["new keyword1", "new keyword2"],
        answer: "new answer",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.reply.answer).toEqual("new answer");
        expect(res.body.reply.keywords).toEqual([
          "new keyword1",
          "new keyword2",
        ]);
        return done();
      });
  });
  test("DELELE/reply", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });
    const newReply = new ReplyModel({
      botBelongs: newBotRecord._id,
      keywords: ["keyword1", "keyword2"],
      answer: "answer",
    });

    user.OwnedBots.push(newBotRecord._id);
    newBotRecord.replies.push(newReply._id);

    user.save();
    newBotRecord.save();
    newReply.save();

    request(app)
      .delete("/bot/reply")
      .set("x-auth-token", authToken)
      .send({
        botId: newBotRecord._id,
        replyId: newReply._id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.reply.answer).toEqual("answer");
        expect(res.body.reply.keywords).toEqual(["keyword1", "keyword2"]);
        return done();
      });
  });
  test("PATCH/invite-moderator", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });

    user.OwnedBots.push(newBotRecord._id);

    user.save();
    newBotRecord.save();

    request(app)
      .patch("/bot/invite-moderator")
      .set("x-auth-token", authToken)
      .send({
        userToInviteId: userToInvite._id,
        botId: newBotRecord._id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.bot._id).toEqual(newBotRecord._id.toString());
        expect(res.body.bot.userModerators[0]).toEqual(
          userToInvite._id.toString()
        );
        return done();
      });
  });
  test("PATCH/remove-moderator", (done) => {
    const newBotRecord = new BotModel({
      userCreated: user._id,
      instagramUrl: "url1",
    });

    user.OwnedBots.push(newBotRecord._id);
    newBotRecord.userModerators.push(userToInvite._id);
    userToInvite.InvitedBots.push(newBotRecord._id);

    userToInvite.save();
    user.save();
    newBotRecord.save();

    request(app)
      .patch("/bot/remove-moderator")
      .set("x-auth-token", authToken)
      .send({
        userToRemoveId: userToInvite._id,
        botId: newBotRecord._id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.bot._id).toEqual(newBotRecord._id.toString());
        expect(res.body.bot.userModerators).toEqual([]);
        return done();
      });
  });
});
