# Instagram replier backend


## Project setup
```
npm i
```

rename .env.example to .env

## Run developer mode
```
npm run dev
```

## Run production mode
```
npm run start
```

## Run tests
```
npm run test
```
to run specific test case change "package.json" file:
```
"scripts": {
    "test": "jest --watchAll --verbose --detectOpenHandles"
  },
```
to
```
"scripts": {
    "test": "jest --group=integration --watchAll --verbose --detectOpenHandles"
  },
```
you can not only choose to run unit or integration test groups, but also nested test groups:
```
"scripts": {
    "test": "jest --group=unit/services/bot --watchAll --verbose --detectOpenHandles"
  },
```


## Links
- Link to the API [Heroku](https://frozen-cove-28174.herokuapp.com/status)
- API documentation [Postman](https://documenter.getpostman.com/view/10805202/TWDdhsua)
