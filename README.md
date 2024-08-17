# NestJS CSV Handler Service

This is a NestJS-based CSV handler service that allows you to handle CSV files and process them using RabbitMQ and PostgreSQL.

## Prerequisites

Before running the app, make sure you have the following installed:

    1) Node.js (version 20.x.x or higher)
    2) Docker and Docker Compose

## Environment Variables

The app requires several environment variables to be set in a `.env` file. Create a `.env` file in the root directory of the project and set the following variables:
```
# Application
APP_PORT=4000
APP_JWT_SECRET = MY_SECRET

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5438
POSTGRES_USER=csvhandler
POSTGRES_PASSWORD=password
POSTGRES_DB=csvhandler

# RabbitMQ
RABBITMQ_PORT = 5672
RABBITMQ_HOST = localhost
RABBITMQ_USERNAME = rabbit
RABBITMQ_PASSWORD = password
```

## Running the App

You can run the app in two ways:

### 1. Using Docker Compose

To run the app using Docker Compose, follow these steps:

1) Open a terminal in the root directory of the project.
2) Run `docker compose up`.
3) The app, along with PostgreSQL and RabbitMQ, will start running.
4) Access the API documentation at bottom of this page.


### 2. Manually

To run the app manually, follow these steps:

1) Open a terminal in the root directory of the project.
2) Run `docker compose up` to start the PostgreSQL and RabbitMQ containers.
    Stop the app container by running `docker stop csv-handler-service-app`.
3) Run the app manually by running `npm install` and `npm run start:dev` or `npm run start:prod`.
    The app will start running.
4) Test the app using `npm run test`.
5) Access the API documentation at bottom of this page.

## API Documentation

The API documentation is available at https://documenter.getpostman.com/view/28090047/2sA3s9C84P.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

