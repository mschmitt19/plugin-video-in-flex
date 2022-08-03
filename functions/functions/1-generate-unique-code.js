const randomstring = require("randomstring");

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  const { taskSid } = event;

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  // Note: we don't create the video room yet, because it has only a 5-min TTL if no one connects to it.
  // const video_room_name = randomstring.generate();

  // Generate a short unique id for the client-facing url
  // We create a SYNC document to store the data about this request.
  // The unique code is also the unique name of the document so it's easy to find later on.
  let unique_code = "";
  let document = null;
  while (!document) {
    unique_code = randomstring.generate({
      length: context.CODE_LENGTH,
      charset: "alphanumeric",
    });
    document = await client.sync
      .services(context.SYNC_SERVICE_SID)
      .documents.create({
        uniqueName: unique_code,
        ttl: context.CODE_TTL,
        data: {
          task: taskSid,
          room: null, // Will be filled-in when the agent connects and opens the Video room
        },
      })
      .catch((reason) => null);
  }

  // Update task attributes to have the syncDocument data
  const current_task = await client.taskrouter
    .workspaces(context.TASKROUTER_WORKSPACE_SID)
    .tasks(taskSid)
    .fetch();

  const current_attributes = JSON.parse(current_task.attributes);

  current_attributes.syncDocument = document.sid;

  await client.taskrouter
    .workspaces(context.TASKROUTER_WORKSPACE_SID)
    .tasks(taskSid)
    .update({
      attributes: JSON.stringify(current_attributes),
    })
    .then((task) => console.log(task.attributes));

  // Respond with the unique code for the client-facing URL.
  response.setBody({
    unique_code: unique_code,
    valid_until: document.dateExpires,
    full_url: `https://${context.DOMAIN_NAME}/video.html?code=${unique_code}`,
  });

  callback(null, response);
};
