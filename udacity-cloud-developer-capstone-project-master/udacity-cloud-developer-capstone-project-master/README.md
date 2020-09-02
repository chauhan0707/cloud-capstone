# Serverless Daily Diary Application

Serverless diary application where a user can note down their thoughts, feelings and images.


## Functionality of the application

- [x] **A user needs to authenticate in order to use an application home: See image below**
- [x] **The application allows users to create, update, delete diary items.**
- [x] **The application allows users to upload a file.**
- [x] **The application only displays items/Diaries for a logged in user.**

### Images
![image](https://user-images.githubusercontent.com/7910856/80206818-51aa7f80-862d-11ea-842f-3169516927f9.png)

![image](https://user-images.githubusercontent.com/7910856/80209244-fcbd3800-8631-11ea-9aaa-abe7bef2a5f4.png)

![image](https://user-images.githubusercontent.com/7910856/80209666-bfa57580-8632-11ea-91e2-0e7bd86b5bc1.png)


The application consists of a frontend and backend.

### Frontend

The `client` folder contains a web application that can use the API developed in the project.
This frontend works with the serverless application.

### Backend
The `backend` folder contains a serverless application that uses the [serverless framework](https://github.com/serverless)

- The code is split into multiple layers separating business logic from I/O related code.
- Code is implemented using async/await and Promises without using callbacks.

#### Authentication

Authentication in this application, is done through [Auth0](https://auth0.com/), Which uses asymmetrically encrypted JWT tokens.

- https://auth0.com/blog/navigating-rs256-and-jwks/


## Usage

### The Backend

#### Development

In order to run local developments, the following packages are needed:
- [serverless](https://github.com/serverless/serverless)
- [serverless-offline](https://github.com/dherault/serverless-offline)
- [serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
- [serverless-s3-local](https://github.com/ar90n/serverless-s3-local)

**Dependency Installation**

The Serverless Framework will need us to configure access to AWS. This can be accomplished by running

`serverless config credentials --provider aws --key KEY --secret SECRET`

>Where KEY and SECRET are our AWS Key and secret key. We are not deploying to AWS, but the serverless plugin needs this configuration to exist in order to work correctly.

```bash
npm install -g serverless
npm install -g serverless-offline
serverless plugin install --name serverless-dynamodb-local
serverless plugin install --name serverless-s3-local
```

**Run serverless offline**

```bash
cd backend
npm i
export IS_OFFLINE=true
serverless offline --httpPort 3050 --printOutput
```
Once the serverless application is running open [Postman](https://www.postman.com) and test the requests, see configuration below.

On a separate terminal run the following command which will start a dynamoDb and s3 instance locally:
```bash
cd backend
serverless dynamodb install
serverless dynamodb start &
serverless s3 create
serverless s3 start &
```

#### Deployment

To deploy an application run the following commands:

```bash
cd backend
export NODE_OPTIONS=--max_old_space_size=8192
npm install
serverless deploy -v
```

### The Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```bash
cd client
npm install
# If locally developing
export REACT_APP_IS_OFFLINE=false
npm run start
```

or, run on a docker container:
```bash
docker build -t "$USER/$(basename $PWD)" .
docker run -it --rm -v ${PWD}:/app -p 3000:3000 "$USER/$(basename $PWD)"
```

This should start a development server with the React application that will interact with the serverless application.

## Best practices applied


- All resources in the application are defined in the serverless.yml file.
- Each function has its own set of permissions.
- Application has sufficient monitoring.
- HTTP requests are validated.

## Postman debugging API

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
