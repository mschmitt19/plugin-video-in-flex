<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Twilio Video - Quickstart _Lite_

This application is aimed at standing up a 1:1 video room solution rapidly, by utilizing:

- [Twilio Video JS SDK](https://www.twilio.com/docs/video/javascript)
- [React + TypeScript](https://reactjs.org/)
- [Next JS](https://nextjs.org/)
- [Twilio Paste](https://paste.twilio.design/)

The repository was started with [this template](https://github.com/twilio-labs/paste/tree/main/packages/paste-nextjs-template) provided by [Twilio Labs](https://www.twilio.com/labs).

---

## Functionality Overview

TODO: insert summary & screenshots

- **Pre-Session Screen** - currently shows the Video Room code prior to joining; would like to add in PreFlight checks and audio/video device configuration
- **Video Room UI** - shows the _remote_ and _local_ participants, with options to toggle the microphone & camera on/off, share screen, and disconnect from the room
- **Post Call UI** - an interface to display after the call has concluded or the participant leaves the room (e.g. disposition, feedback)

---

### Twilio Account Settings

Before we begin, we need to collect all the config values we need to run this quickstart app:

| Config&nbsp;Value | Description                                                                                                                          |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                 |
| Auth Token        | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console). |

---

## Local Development

After the above requirements have been met:

1. Clone this repository.

   ```bash
   git clone git@github.com:mschmitt19/twilio-video-react-quickstart-lite.git
   ```

2. Install dependencies.

   ```bash
   npm i
   ```

3. Create a `.env.local` file and update the values:

   ```bash
   cp .env.example .env
   ```

4. To run the app locally:

   ```bash
   npm run dev
   ```

## Build & Deploy Application for Twilio Asset Deployment

1. Run the following command to build the application and transfer the build output to the `../functions/assets` folder:

   ```bash
   npm run build
   ```

2. Within the `../functions` directory, run the following command to deploy the updated build:

   ```bash
   twilio serverless:deploy --assets
   ```

---

## Changelog

### 1.0.0

**August 30, 2022**

- Updated README.

## Disclaimer

This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.

---

## Appendix

### Using `create-next-app`

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/twilio-labs/paste/tree/main/packages/paste-nextjs-template my-paste-app
# or
yarn create next-app --example https://github.com/twilio-labs/paste/tree/main/packages/paste-nextjs-template my-paste-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).
