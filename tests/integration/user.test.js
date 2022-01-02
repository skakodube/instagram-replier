/**
 * Tests User route
 *
 * @group integration/routes/user
 */

const request = require('supertest');
const app = require('../../src/app');
const UserModel = require('../../src/api/models/user');
const jwtHelper = require('../../src/api/helpers/jwt');

describe('/user', () => {
  let user, authToken;
  beforeEach(async () => {
    user = new UserModel({
      firstName: 'Mark',
      lastName: 'Watney',
      email: 'skakodube@gmail.com',
      password: '12345',
      isVerified: true,
    });
    user.password = '12345';
    await user.save();
    authToken = jwtHelper.generateJWT(user);
  });
  afterEach(async () => {
    await UserModel.deleteMany({});
  });
  test('PUT/', async () => {
    await request(app)
      .put('/user')
      .set('x-auth-token', authToken)
      .send({
        firstName: 'Anna',
        lastName: 'Doe',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user.firstName).toEqual('Anna');
      });
  });

  test('PATCH/reset-password', async () => {
    const oldUserPassoword = user.password;
    await request(app)
      .patch('/user/reset-password')
      .set('x-auth-token', authToken)
      .send({
        oldPassword: '12345',
        newPassword: '54321',
      })
      .expect(200)
      .then(async (res) => {
        await UserModel.findOne({ email: user.email }).then((res) => {
          expect(res.password).not.toEqual(oldUserPassoword);
        });
      });
  });

  test('PATCH/change-email', async () => {
    await request(app)
      .patch('/user/change-email')
      .set('x-auth-token', authToken)
      .send({
        password: '12345',
        newEmail: 'newemail@email.com',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user.email).toEqual('newemail@email.com');
      });
  });

  test('GET/send-activate-email', async () => {
    await request(app)
      .get('/user/send-activate-email')
      .set('x-auth-token', authToken)
      .query({
        link: 'link1',
      })
      .expect(200);
  });

  test('PATCH/activate-account', async () => {
    user.isVerified = false;
    user.generateReset();
    await user.save();

    await request(app)
      .patch('/user/activate-account')
      .set('x-auth-token', authToken)
      .send({
        token: user.resetToken,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user.isVerified).toEqual(true);
      });
  });

  test('GET/send-recover-email', async () => {
    await request(app)
      .get('/user/send-recover-email')
      .query({ email: 'skakodube@gmail.com', link: 'link1' })
      .expect(200);
  });

  test('PATCH/recover-password', async () => {
    const oldUserPassoword = user.password;

    user.generateReset();
    await user.save();

    await request(app)
      .patch('/user/recover-password')
      .send({
        token: user.resetToken,
        password: '54321',
      })
      .expect(200)
      .then(async (res) => {
        await UserModel.findOne({ email: user.email }).then((res) => {
          expect(res.password).not.toEqual(oldUserPassoword);
        });
      });
  });
});
