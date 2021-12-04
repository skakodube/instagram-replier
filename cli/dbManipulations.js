const UserService = require('../src/api/services/userService');
const BotService = require('../src/api/services/BotService');
const config = require('../src/config');
const mongoose = require('mongoose');

const addUser = async () => {
  const user = {
    firstName: 'Admin',
    lastName: 'Yaro',
    email: '5y.lmwg@gmail.com',
    password: 'smpa-password',
    isAdmin: true,
    verificationLink: ''
  };

  const userService = new UserService();
  const response = await userService.signup(user);
  console.log(response);
};

const addBot = async () => {
  const bot = {
    instagramUrl: 'https://www.instagram.com/ffenin/',
    credentials: {
      username: 'ffenin',
      password: '62956438'
    }
  };

  const botService = new BotService();

  const response = await botService.createBot({ email: '5y.lmwg@gmail.com' }, bot);
  console.log(response);
};

const run = async () => {
  const conn = await mongoose.connect(config.databaseURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

  //await addUser();
  await addBot();
};

run();
