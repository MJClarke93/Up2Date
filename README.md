# Up2Date
This program is built as part of Assignment 3 for Advanced Internet Programming at the University of Technology, Sydney, during the Spring 2018 semester.

It was developed by **Abhusha Bogati**, **Mitchell Clarke** and **Maggie Liuzzi**.



  ## Description

Up2Date is a news and social media aggregation web application. Its goal is to give users the speed and convenience of seeing news articles and social media posts they are interested in, all in one place.  Its design aims to be "simple, but effective".

Currently it imports posts using the Twitter and News APIs, as examples. More applications may be supported in future versions.



  ## Installation

To get the app running, you'll need **Node.js** and **npm** installed. If you do not have it, you can download them from here: https://nodejs.org/en/

You'll also need **MongoDB** installed for database connectivity to work. If you do not have it, you can download it from here: https://www.mongodb.com/download-center

Once these are installed, complete the following steps:

  1. Clone this repo to a directory of your choice using git:

     ```shell
     git clone https://github.com/MJClarke93/Up2Date.git
     ```

  2. Enter the new directory and install the dependencies:

     ```shell
     cd Up2Date
     npm install
     ```

  3. Generate your Twitter API keys at: https://developer.twitter.com/en/apps/ and your News API key at: https://newsapi.org/


  4. Create an .env file inside the app folder and add your keys like this (and add '.env' to your .gitignore):

     ```shell
     CONSUMER_KEY=yourkey
     CONSUMER_SECRET=yourkey
     ACCESS_TOKEN=yourkey
     ACCESS_TOKEN_SECRET=yourkey
     NEWSAPI_KEY=yourkey
     ```

  5. Once the dependencies are installed, simply run one of the following:

     ```shell
     # If you're on Windows:
     npm run start-bat
     # If you're on Unix:
     npm run start-sh
     ```

Occasionally, an error may occur where the back-end server fails to connect to the database. This occurs because "npm run start-X" attempts to load the 3 servers - MongoDB, Express, React - simultaneously. If the booting of the database is delayed and doesn't finish until after the Express server has finished loading, then it will fail to make a connection. To avoid this, you can manually start each component of the application one at a time, starting with the database:

```shell
# If you're on Windows:
npm run db-bat
# If you're on Unix:
npm run db-sh
```

Then the Express server and React client:

```shell
# To start the Express server:
npm run server
# To start the React client:
npm run client
```

MongoDB runs on its default port of 27017. The Express server uses Port 3001 and the React server uses Port 3000. When running on a local machine, you can access the application from http://localhost:3000

If you receive errors or strange behavior, particularly regarding the database unexpectedly closing for example, check that these ports are unoccupied.



## Known Bugs

- Refreshing the page will log out the user.
<<<<<<< HEAD
- By manually sending an appropriate request to the server API, the tags a user is interested in receiving posts about can be retrieved without being logged in.
- On the settings page, choosing to update your tags to be empty then switching to the Dashboard can crash the Express server.
=======
- By manually sending an appropriate request to the server API, the tags a user is interested in receiving posts about can be retrieved without being logged in.
>>>>>>> 9394aebff272d9ad8c956bc28ecb0b1104da53a0
