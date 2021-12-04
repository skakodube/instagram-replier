# Instagram replier backend


## Project setup
```
npm i
```

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
npm run start
```
to run specific test case change "package.json" file to:
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
you can choose not to run unit or integration tests, but also nested test group:
```
"scripts": {
    "test": "jest --group=unit/services/bot --watchAll --verbose --detectOpenHandles"
  },
```


## Links
- Link to the API [Heroku](https://instagram-replier.herokuapp.com/status)
- API documentation [Postman](https://documenter.getpostman.com/view/10805202/TWDdhsua)
