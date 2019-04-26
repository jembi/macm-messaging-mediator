# mACM Messaging Mediator [![Build Status](https://travis-ci.com/jembi/rapidpro-messaging-mediator.svg?token=HL2Z5FKkgvPyxYf3MGbf&branch=master)](https://travis-ci.com/jembi/rapidpro-messaging-mediator)

A messaging mediator that implements the IHE mACM profile.

## Development
To install the mediator and work with it locally run the following commands:

```
git clone git@github.com:jembi/macm-messaging-mediator.git
cd macm-messaging-mediator
npm install
```
Start the Hearth and MongoDB docker containers using `docker-compose`  
```
docker-compose up -d
```
Running the containers is not required if another Hearth instance is available.

To start the mediator without Docker please set the required environmental variables and run the following command:
```
npm start
```
**Environmental Variable**  

  Key  | Description
 ------- | -----------
 NODE_ENV | Nodejs application environment
 HEARTH_HOST | Hearth host name
 HEARTH_PORT | The port Hearth is running on
 HEARTH_SECURED | `true` for `https` and `false` for `http`
 PORT | Port number for the mACM messaging mediator 

## Running Tests

To run automated tests please run the following command:
```
npm test
```

To run tests in watch mode:
```
npm test:watch
```
