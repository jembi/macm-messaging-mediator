# mACM Messaging Mediator [![Build Status](https://travis-ci.com/jembi/macm-messaging-mediator.svg?token=HL2Z5FKkgvPyxYf3MGbf&branch=master)](https://travis-ci.com/jembi/macm-messaging-mediator) [![codecov](https://codecov.io/gh/jembi/macm-messaging-mediator/branch/master/graph/badge.svg?token=dejEYdMvrg)](https://codecov.io/gh/jembi/macm-messaging-mediator)

The mACM Messaging Mediator is an OpenHIM mediator that acts as an alert aggregator as specified in the [mACM IHE profile](https://wiki.ihe.net/index.php/Mobile_Alert_Communication_Management(mACM)). The mediator relies on a FHIR store for data persistence and supports third-party messaging services such Twilio and Clickatell for message sending. [Hearth](https://github.com/jembi/hearth) is the default FHIR store used by the mediator even though it is possible to replace it with an alternative FHIR store.

#### Supported mACM Features
- Mobile Report Alert [ITI-85]
- Query for Alert Status [ITI-84]

## Dependencies
- Node.js `10.15.3`
- [Hearth](https://github.com/jembi/hearth) `v1.0.0-beta.1`
- Mongodb `3.6`
- [OpenHIM](http://openhim.org/)

## Running Development
To install the mediator and work with it on a development environment run the following commands:

```
git clone git@github.com:jembi/macm-messaging-mediator.git
cd macm-messaging-mediator
npm install
```
Start the Hearth, OpenHIM and MongoDB docker containers using `docker-compose`  
```
docker-compose up -d
```
Running the containers is not required if other Hearth instances of Hearth and OpenHIM are available available.

To start the mediator without Docker please set the required environmental variables and run the following command:
```
npm start
```

Some services might require a webhook configured in the config file. For your development environment, we advise that you use [ngrok](https://ngrok.com/) to allow external services to call your webhook endpoints.

## Running in Production

Because the mediator is built with the Typescript programming language, first you need to transpile the code javascript and then start the application.

Transpile:
```
npm run build
```
Make sure that the `NODE_ENV` environment variable is set to `production` and that the correct port number is set.  
Start:
```
npm run start:production
```

## Running Tests

To run automated tests please run the following command:
```
npm test
```

To run tests in watch mode:
```
npm test:watch
```

## Configuration

Application and mediator configuration can be found at `config/`. Make sure that the configuration file name is set to value of your `NODE_ENV` varaible (e.g `production.json` or `staging.json`). The file contains all the configuration for the messaging channels and OpenHIM mediator setup. The configuration file is broken down into three subsections:

#### Channels
This is where you configure the channels and services to be used by the mediator. Refer to the following list for all the different options:

**`webhook`**  
This is optional and is used to specify the host to be used by the service that sends message delivery status updates via webhooks.

**`webhook.host`**  
The host address is required and is to be used for the webhook, this address could be any valid domain name or IP address.

**`webhook.protocol`**  
The HTTP protocol to used, this should be “http” or “https” and is required.

**`webhook.port`** 
The port number is optional. The service will default to port 80 when this value is not specified.

**`metadata`**  
The metadata field is required and used to configure all channels and services. This field must contain at least one channel with at least one service.

**`metadata.type`**  
The identifier for the channel. Example values here are “sms”, “whatsapp” (not supported yet), “other”, or other new channels defined in future.

**`metadata.default`**  
This is an optional field and specifies whether this channel is to be used as the default channel. Channels are used as default channels when the CommunicationRequest resource does not specify the channel in the “CommunicaitonRequest.channel” extension field. Only one channel should be specified as the default channel. 

**`metadata.services`**  
Defines a collection of services for the channel.

**`metadata.service.default`**  
This is an optional field and specifies when this service is to be used as the default service. Services are used as default services when the CommunicationRequest resource does not specify the channel or service in the “CommunicationRequest.channel” extension.

**`metadata.service.name`**  
This is the name of the service and must match the name of the module implementing the service. The name is case-sensitive as it used to match module names in the code.

**`metadata.service.props`**
The component allows extra data to be passed to services via “props”. Props are extra fields required by the service and accessible via the message service interface.

#### openhim
This is configuration data for communicating with the OpenHIM. Options include:

**`api.username`**  
OpenHIM account username.

**`api.password`**  
OpenHIM account password.

**`api.apiUrl`**  
OpenHIM API url, the default is usually the url with port `8080`.

**`api.trustSelfSigned`**  
When set to true, the mediator will trust self-signed ssl certificated from the OpenHIM.  

#### Mediator
Every mediator must register itself with the OpenHIM and use the information under `openhim` options to communicate with the OpenHIM. This section of the configuration deals with all the data required by the mediator to successfully register itself with the OpenHIM. All the configuration options can be found [here](https://openhim.readthedocs.io/en/latest/dev-guide/mediators.html#mediator-registration).

## Environmental Variable  

  Key  | Description
 ------- | -----------
 NODE_ENV | Nodejs application environment
 HEARTH_HOST | Hearth host name
 HEARTH_PORT | The port Hearth is running on
 HEARTH_SECURED | `true` for `https` and `false` for `http`
 PORT | Port number for the mACM messaging mediator

 ## Known Issues
 - The `telecom` element data type for contained resources does not conform to the FHIR specification. This element will need to be changed to a collection.
 - Security of the Mediator needs to be considered. At the moment it is assumed that security is provided through the OpenHIM, and the mediator itself made inaccessible to external access. In addition, security between the Mediator and the FHIR store needs to be considered. 

 ## Limitations
- Performance Issues
  - The current implementation has performance limitations since all transactions are synchronous.
  - A queuing mechanism will need to be implemented to allow the component to process each ITI-84 transaction in the background and respond quicker to reporters.
- Service Persistence
  - While services can optionally handle transaction ITI-85, there is currently no way to prevent the persistence of the CommunicationRequest resource that comes in as part of transaction ITI-84.
  - No Capability Statement
  - The component does not currently expose a CapabilityStatement resource as recommended in the FHIR specification.
- No XML Support
  - The component supports the JSON format for messages but does not currently support XML as specified by the mACM IHE profile and the FHIR specifications.
- FHIR Version Support
  - The component supports FHIR STU3 http://hl7.org/fhir/STU3/index.html. This is due to the dependency on Hearth which currently supports STU3 at the time of writing. 
- No formal FHIR profile for Communication and CommunicationRequest resources
  - There is no formally defined or published profile for the Communication and CommunicationRequest resources. 
- Only supports contained resources for Recipient and Requester.
- No configuration support from the OpenHIM console

