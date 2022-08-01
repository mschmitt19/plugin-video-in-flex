exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { document: document_sid, StatusCallbackEvent, RoomSid } = event;

  // Validate that the unique code is valid, i.e.: that the SYNC document exists
  const document = await client.sync
    .services(context.SYNC_SERVICE_SID)
    .documents(document_sid)
    .fetch()
    .catch((reason) => null);

  if (!document) {
    console.error(
      `ERROR: the requested document ${document_sid} does not exist.`
    );
    return callback();
  }

  if (RoomSid !== document.data.room) {
    console.error(
      `ERROR: RoomSid ${RoomSid} does not match document ${document_sid}: ${document.data.room}`
    );
    return callback();
  }

  console.log(
    `Room ${RoomSid} (document ${document_sid}) event: ${StatusCallbackEvent}`
  );

  switch (StatusCallbackEvent) {
    case "room-ended":
      await client.sync
        .services(context.SYNC_SERVICE_SID)
        .documents(document.sid)
        .update({ data: { ...document.data, room: null } })
        .catch((reason) => {
          console.error(
            `ERROR: could not update document ${document_sid}: ${reason}`
          );
        });
      break;
  }

  callback();
};
