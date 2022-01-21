/**
 * Tests Auth route
 *
 * @group integration/routes/auth
 */

const request = require('supertest');
const app = require('../../src/app');
const UserModel = require('../../src/api/models/user');
const jwtHelper = require('../../src/api/helpers/jwt');
const sgMail = require('@sendgrid/mail');

describe('/auth', () => {
  beforeAll(() => {
    sgMail.send = jest.fn().mockResolvedValue(); //email mock
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
  });
  test('POST/login', async () => {
    const user = new UserModel({
      firstName: 'Mark',
      lastName: 'Watney',
      email: 'mark.watney@email.com',
      password: '12345',
      isVerified: true,
    });
    user.password = '12345';
    await user.save();
    authToken = jwtHelper.generateJWT(user);

    await request(app)
      .post('/auth/login')
      .set('x-auth-token', authToken)
      .send({
        email: 'mark.watney@email.com',
        password: '12345',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user._id).toEqual(user._id.toString());
        expect(res.body.user.email).toEqual(user.email);
      });
  });

  test('POST/signup', async () => {
    await request(app)
      .post('/auth/signup')
      .send({
        firstName: 'Anna',
        lastName: 'Doe',
        email: 'email@email.com',
        password: '12345',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.user.email).toEqual('email@email.com');
        expect(res.body.user.firstName).toEqual('Anna');
      });
  });
});
