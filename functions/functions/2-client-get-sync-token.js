const randomstring = require("randomstring");
const AccessToken = require("twilio").jwt.AccessToken;
const { SyncGrant } = AccessToken;

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

  // Generate a random identity for the customer.
  // This could also be a name we ask him to provide in a form.
  const client_identity = randomstring.generate();
  console.log("Client identity for Sync : ", client_identity);

  // Give read-only rights to the SYNC Document to this identity so the UI can subscribe to live updates
  await client.sync
    .services(context.SYNC_SERVICE_SID)
    .documents(code)
    .documentPermissions(client_identity)
    .update({ read: true, write: false, manage: false })
    .then((document_permission) => true)
    .catch((reason) => {
      console.error(`Error giving permission to ${code}: ${reason}`);
      return null;
    });

  // Create an access token which we will sign and return to the client,
  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.TWILIO_API_KEY,
    context.TWILIO_API_SECRET,
    { identity: client_identity }
  );

  // Add grants to the SYNC document and the VIDEO room to that token
  const syncGrant = new SyncGrant({
    serviceSid: context.SYNC_SERVICE_SID,
  });
  token.addGrant(syncGrant);

  if (!document.data.task) {
    // Create a task for agents
    const attributes = {
      type: "video", // Any attribute we want for the task (customer name, topic, page visited, ....?)
      syncDocument: document.sid, // We provide the document SID to the agent so he can get the meeting details.
    };

    const task_created = await client.taskrouter
      .workspaces(context.TASKROUTER_WORKSPACE_SID)
      .tasks.create({
        taskChannel: "video",
        workflowSid: context.TASKROUTER_VIDEO_WORKFLOW_SID,
        attributes: JSON.stringify(attributes),
      })
      .then((task) => ({ ...document.data, task: task.sid }))
      .then((new_document_data) =>
        client.sync
          .services(context.SYNC_SERVICE_SID)
          .documents(document.sid)
          .update({ data: new_document_data })
      )
      .catch((reason) => false);

    if (!task_created) {
      response.setStatusCode(503);
      response.setBody({ error: `Error contacting an agent.` });
      return callback(null, response);
    }
  }

  // The task has been created, we respond to the client with his identity and his token
  // With those the Frontend JS can subscribe to the SYNC document and get notified when the agent connects.
  response.setBody({ token: token.toJwt() });
  return callback(null, response);
};
