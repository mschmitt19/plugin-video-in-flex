const Video = Twilio.Video;
const Sync = Twilio.Sync;

let code = "";
let video_room = null;

function connect_sync() {
  // Obtain a JWT access token
  fetch(`/2-client-get-sync-token?code=${code}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        throw response.error;
      }
      return new Twilio.Sync.Client(response.token);
    })
    .then((client) => client.document(code))
    .then((document) => {
      console.log("Code Validated. Sync document SID:", document.sid);
      display_code_valid(true);
      process_sync_data_update(document.data);
      document.on("updated", (event) => {
        console.log('Received an "updated" Sync Document event: ', event);
        process_sync_data_update(event.data);
      });
    })
    .catch((error) => {
      display_code_valid(false);
      console.error("Unexpected error", error);
    });
}

function process_sync_data_update(data) {
  display_task_created(data.task);
  if (!video_room && data.room) connect_video();
}

// Attach the Tracks to the DOM.
function attachTracks(tracks, container) {
  tracks.forEach(function (track) {
    if (track.track) track = track.track;
    if (!track.attach) return;
    let trackDom = track.attach();
    trackDom.style.maxWidth = "100%";
    container.appendChild(trackDom);
  });
}

// Detach the Tracks from the DOM.
function detachTracks(tracks) {
  tracks.forEach(function (track) {
    if (track.track) track = track.track;
    if (!track.detach) return;
    track.detach().forEach(function (detachedElement) {
      detachedElement.remove();
    });
  });
}

function connect_video() {
  // Obtain a JWT access token
  fetch(`/4-client-get-video-token?code=${code}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        throw response.error;
      }
      return Video.connect(response.token);
    })
    .then(
      (room) => {
        video_room = room;
        display_joined_room(room);
        console.log(`Successfully joined a Room: ${room}`);
        const localParticipant = room.localParticipant;
        console.log(
          `Connected to the Room as LocalParticipant "${localParticipant.identity}"`
        );

        room.localParticipant.on("trackEnabled", (track) => {
          console.log("enabled", track);
          if (track === this.state.localAudio) {
            this.setState({ audioEnabled: true });
          } else if (track === this.state.localVideo) {
            this.setState({ videoEnabled: true });
          }
        });

        room.localParticipant.on("trackDisabled", (track) => {
          console.log("disabled", track);
          if (track === this.state.localAudio) {
            this.setState({ audioEnabled: false });
          } else if (track === this.state.localVideo) {
            this.setState({ videoEnabled: false });
          }
        });

        const remoteMedia = document.getElementById("remote-media-div");

        // add existing participant tracks
        room.participants.forEach((participant) => {
          console.log(
            `IncomingVideoComponent: ${participant.identity} is already in the room}`
          );
          const tracks = Array.from(participant.tracks.values());
          this.attachTracks(tracks, remoteMedia);
        });

        // When a Participant joins the Room
        room.on("participantConnected", (participant) => {
          console.log(
            `IncomingVideoComponent: ${participant.identity} joined the room}`
          );
        });

        // when a participant adds a track, attach it
        room.on("trackSubscribed", (track, publication, participant) => {
          console.log(
            `IncomingVideoComponent: ${participant.identity} added track: ${track.kind}`
          );
          this.attachTracks([track], remoteMedia);
        });

        // When a Participant removes a Track, detach it from the DOM.
        room.on("trackUnsubscribed", (track, publication, participant) => {
          console.log(
            `IncomingVideoComponent: ${participant.identity} removed track: ${track.kind}`
          );
          this.detachTracks([track]);
        });

        // When a Participant leaves the Room
        room.on("participantDisconnected", (participant) => {
          console.log(
            `IncomingVideoComponent: ${participant.identity} left the room`
          );
        });

        // Room disconnected
        room.on("disconnected", () => {
          console.log("IncomingVideoComponent: disconnected");
        });
      },
      (error) => {
        console.error(`Unable to connect to Room: ${error.message}`);
      }
    )
    .catch((error) => {
      console.error("Unexpected error", error);
    });
}

function display_code_valid(valid) {}

function display_task_created(task_sid) {}

function display_joined_room(room) {}

$(document).ready(function () {
  code = getUrlParameter("code");
  if (code) {
    connect_sync(code);
  } else {
    alert("Missing code!");
  }
});

const getUrlParameter = function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};
