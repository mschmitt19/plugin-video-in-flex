const randomstring = require("randomstring");
const AccessToken = require("twilio").jwt.AccessToken;
const { VideoGrant } = AccessToken;

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { code } = event;

  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  // Validate that the unique code was provided
  if (!code) {
    response.setStatusCode(404);
    response.setBody({ error: `Missing code.` });
    return callback(null, response);
  }

  // Validate that the unique code is valid, i.e.: that the SYNC document exists
  const document = await client.sync
    .services(context.SYNC_SERVICE_SID)
    .documents(code)
    .fetch()
    .catch((reason) => null);

  if (!document) {
    response.setStatusCode(403);
    response.setBody({ error: `Invalid code.` });
    return callback(null, response);
  }

  // Check if the video room was created already (i.e.: is the agent connected?)
  let room_name = document.data.room;
  if (!room_name) {
    response.setStatusCode(405);
    response.setBody({
      error: `The agent is not yet connected. Please try again later.`,
    });
    return callback(null, response);
  }

  // Generate a random identity for the customer.
  // This could also be a name we ask him to provide in a form.
  const client_identity = randomstring.generate();

  // Create an access token which we will sign and return to the client,
  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.TWILIO_API_KEY,
    context.TWILIO_API_SECRET,
    { identity: client_identity }
  );

  // Authorize the client Frontend to connect to VIDEO
  const videoGrant = new VideoGrant({
    room: room_name,
  });
  token.addGrant(videoGrant);

  // The task has been created, we respond to the client with his identity and his token
  // With those the Frontend JS can subscribe to the SYNC document and get notified when the agent connects.
  response.setBody({ token: token.toJwt() });
  return callback(null, response);
};
