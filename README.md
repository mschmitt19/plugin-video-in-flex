<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Chat to Video Escalation in Flex Plugin

This Flex Plugin shows how an agent can initiate a video room from a webchat conversation within Flex. This plugin was built for **Flex 2.0**.

---

1. [Functionality Overview](#functionality-overview)
   1. [Project Structure](#project-structure)
   1. [Technical Components](#technical-components)
   1. [Example Walkthrough](#example-walkthrough)
   1. [Escalating Chat to Video](#escalating-chat-to-video)
   1. [Video Room JS SDK Events](#video-room-js-sdk-events)
2. [Setup](#setup)
   1. [Requirements](#requirements)
   2. [Twilio Account Settings](#twilio-account-settings)
3. [Local Development](#local-development)
   1. [Twilio Serverless Deployment](#twilio-serverless-deployment)
   2. [Pre-deployment Steps](#pre-deployment-steps)
   3. [Flex Plugin Deployment](#flex-plugin-deployment)
   4. [Testing with Web Chat](#testing-with-web-chat)
   5. [View your plugin in the Plugins Dashboard](#view-your-plugin-in-the-plugins-dashboard)
4. [Changelog](#changelog)
5. [Reference](#reference)
6. [Disclaimer](#disclaimer)

---

## Functionality Overview

### Project Structure

The project structure is broken down into three sections:

- **Flex Plugin** - starting at the root of the directory:
  - The `./src` folder contains the custom components, async logic to make requests to the `Twilio Function`, and helper functions
  - Key highlights of the Flex Plugin UI are encompassed in the components, found at `./src/components`
- **Twilio Serverless** - within the `./functions` directory:
  - This houses the Twilio Functions & Assets
  - The function paths (`./functions/functions`) orchestrate the facilitation of access token generation, sync document management, and video room creation
  - The assets are utilized to host the build output of the customer-facing web application that joins the customer into the video session, ultimately connecting them to the agent; for further details on how this application works, see the [./video-app-quickstart](./video-app-quickstart/) folder
- **Customer Facing Video App** - within the `./video-app-quickstart` directory:
  - A Next JS application built with React, TypeScript, and Twilio Paste design system
  - This application is used by the customer to connect to the video session

### Technical Components

- **Twilio Serverless Functions** - used to orchestrate the API requests to generate access tokens
- **Twilio Serverless Assets** - used to host the customer-side video room UI
- **Twilio Sync** - utilized as the source of truth to store information about the video room and requests
- **Twilio Video JS** - used for connecting and monitoring the video rooms on the client side

### Example Walkthrough

1. The video session can only be initiated by the Agent within Flex. Once determined a video session would be appropriate to resolve the customer's use case, the Agent clicks the `Video Icon` button in the `Task Canvas Header`:

   <img  src="./readme_assets/video-button.png"  alt="Twilio"  width="50%"  />

2. After clicking the button, a request is sent to the Twilio function to generate a unique code, which serves as the video room name. Upon success, the unique code and full url to join the video session are returned to the Flex UI, which then auto-sends a message to the conversation with the customer:

   <img  src="./readme_assets/join-video-message.png"  alt="Twilio"  width="20%"  />

3. Within the Flex UI, a new tab is visible to the Agent within the `Task Canvas Tabs`, labeled `Video Room`:

   <img  src="./readme_assets/join-room-button.png"  alt="Twilio"  width="50%"  />

4. After clicking `Join Video Room`, the agent is connected to the video room and can interact with the customer:

   <img  src="./readme_assets/agent-video-room.png"  alt="Twilio"  width="50%"  />

5. On the customer's end, they would click the link included in the message, which would open a new browser tab to join the video room:

   <img  src="./readme_assets/customer-video-join.png"  alt="Twilio"  width="50%"  />

6. After clicking `Join Video Room`, the customer will connect to the room and interact with the Agent. The buttons below the video allow the customer to toggle their microphone and camera to on/off, share their screen, and disconnect from the video session:

   <img  src="./readme_assets/customer-video-room.png"  alt="Twilio"  width="50%"  />

7. Once the video session is complete and the customer disconnects from the room, there is a _Post Video UI_ where you could collect a CSAT or feedback:

   <img  src="./readme_assets/post-video-room.png"  alt="Twilio"  width="50%"  />

**Note:** An agent will only be able to participate in one video session at a time. Additionally, an Agent must disconnect from the video session before being allowed to complete or wrap-up a task.

### Escalating Chat to Video

The following diagram demonstrates how a chat session can be escalated to video. More specifically, this flow outlines the technical details from agent initiation to connecting to the video room.

<img  src="./readme_assets/Chat-to-Video-Diagram.png"  alt="Twilio"  width="100%"  />

### Video Room JS SDK Events

The next diagram outlines high-level operations that need to be considered when implementing a video room experience, specifically the different types of events that need to be handled as relating to the Room and Participants.

<img  src="./readme_assets/VideoRoom-JS-SDK-Flow-Events.png"  alt="Twilio"  width="100%"  />

---

## Setup

### Requirements

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 14 installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://github.com/twilio-labs/plugin-flex) and the [Serverless Plugin](https://github.com/twilio-labs/serverless-toolkit/tree/main/packages/plugin-serverless). Run the following commands to install them:
  ```bash
  # Install the Twilio CLI
  npm install twilio-cli -g
  # Install the Serverless and Flex as Plugins
  twilio plugins:install @twilio-labs/plugin-serverless
  twilio plugins:install @twilio-labs/plugin-flex
  ```

### Twilio Account Settings

Before we begin, we need to collect all the config values we need to run this Flex plugin:

| Config&nbsp;Value | Description                                                                                                                          |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                 |
| Auth Token        | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console). |

---

## Local Development

After the above requirements have been met:

1. Clone this repository.

   ```bash
   git clone git@github.com:mschmitt19/plugin-video-in-flex.git
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Rename and create the `appConfig.js` file:

   ```bash
   cd public && cp appConfig.example.js appConfig.js
   ```

4. [Configure and build the Customer Facing Video Application](./video-app-quickstart/README.md).

5. [Deploy your Twilio Function](#twilio-serverless-deployment).

6. Run the application.

   ```bash
   twilio flex:plugins:start
   ```

7. Navigate to [http://localhost:3000](http://localhost:3000).

### Twilio Serverless deployment

You need to deploy the function associated with the plugin. The function houses multiple routes called from the plugin to aid in token and room creation. For further information on the technical functionality, please review `./functions/functions`.

#### Pre-deployment Steps

1. Change into the functions directory, install package dependencies, and then rename `.env.example`.

   ```bash
   # Install required dependencies
   npm install
   # Rename example env file
   cd functions && cp .env.example .env
   ```

2. Open `.env` with your text editor and set the environment variables mentioned in the file.

   ```
   ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxx

   TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxx

   TASKROUTER_WORKSPACE_SID=WSxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TASKROUTER_VIDEO_WORKFLOW_SID=WWxxxxxxxxxxxxxxxxxxxxxxxxxxx

   CODE_LENGTH=7
   CODE_TTL=3600
   SYNC_SERVICE_SID=ISxxx

   VIDEO_ROOM_TYPE=group
   VIDEO_RECORD_BY_DEFAULT=true
   ```

3. Deploy the Twilio function to your account using the Twilio CLI:

   ```bash
   cd functions && twilio serverless:deploy
   # Example Output
   # Deploying functions & assets to the Twilio Runtime
   # ⠇ Creating 1 Functions
   # ✔ Serverless project successfully deployed
   # Deployment Details
   # Domain: https://function-name-xxxx-dev.twil.io
   # Service:
   #    function (ZSxxxx)
   # ..
   ```

4. Copy and save the domain returned when you deploy a function. You will need it in the next step.

If you forget to copy the domain, you can also find it by navigating to [Functions > API](https://www.twilio.com/console/functions/api) in the Twilio Console.

> Debugging Tip: Pass the `-l` or logging flag to review deployment logs.

### Flex Plugin Deployment

Once you have deployed the function, it is time to deploy the plugin to your Flex instance.

You need to modify the source file to mention the serverless domain of the function that you deployed previously.

1. In the main directory rename `.env.example`.

   ```bash
   cp .env.example .env
   ```

2. Open `.env` with your text editor and set the environment variables mentioned in the file.

   ```
   # Paste the Function deployment domain
   REACT_APP_VIDEO_APP_URL=https://xxxxxxx
   ```

3. When you are ready to deploy the plugin, run the following in a command shell:

   ```bash
   twilio flex:plugins:deploy --major --changelog "Initial Agent Video Escalation on Web Chat" --description "Agent Video Escalation"
   ```

### Testing with Web Chat

To test this functionality locally with Flex 2.0, clone the [Twilio Flex Web Chat React Sample](https://github.com/twilio/twilio-webchat-react-app) web app.

### View your plugin in the Plugins Dashboard

After running the deployment with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test the plugin on your Flex application!

---

## Changelog

### 1.0.0

**August 9, 2022**

- Updated README and pushed code.

## Reference

This plugin was created & inspired by a pre-existing solution located in [this repo](https://github.com/jlbrs/Twilio-Video-in-Twilio-Flex), for reference.

## Disclaimer

This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
