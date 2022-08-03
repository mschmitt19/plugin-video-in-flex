import React, { useState, useEffect, useRef, createRef } from "react";
import { withTaskContext } from "@twilio/flex-ui";
import Video from "twilio-video";
import { Button } from "@twilio-paste/core/button";
import { Flex as FlexPaste } from "@twilio-paste/core/flex";
import { Theme } from "@twilio-paste/core/theme";
import { Tooltip } from "@twilio-paste/core/tooltip";
import { Box } from "@twilio-paste/core/box";

import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import { VideoOffIcon } from "@twilio-paste/icons/esm/VideoOffIcon";
import { LinkExternalIcon } from "@twilio-paste/icons/esm/LinkExternalIcon";
import { MicrophoneOnIcon } from "@twilio-paste/icons/esm/MicrophoneOnIcon";
import { MicrophoneOffIcon } from "@twilio-paste/icons/esm/MicrophoneOffIcon";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";

import {
  btn,
  btnContainer,
  btnRow,
  btnVideoApp,
  btnVideoAppIcon,
  btnVideoAppRow,
  mediaTrackContainer,
  supervisorContainerStyle,
  taskContainerStyle,
} from "./styles";

interface IncomingVideoComponentProps {
  task?: any;
  manager: any;
  inSupervisor: boolean;
}
const BACKEND_URL = process.env.REACT_APP_VIDEO_APP_URL;
const VIDEO_APP_URL = process.env.REACT_APP_VIDEO_APP_URL;

const IncomingVideoComponent: React.FunctionComponent<
  IncomingVideoComponentProps
> = ({ task, manager, inSupervisor }) => {
  const [connecting, setConnecting] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Video.Room | null>(null);
  const [screenTrack, setScreenTrack] = useState<Video.Track | null>(null);
  const [localAudio, setLocalAudio] = useState<Video.LocalAudioTrack | null>(
    null
  );
  const [localVideo, setLocalVideo] = useState<Video.LocalVideoTrack | null>(
    null
  );
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const remoteMediaDiv = useRef();

  useEffect(() => {
    console.log("IncomingVideoComponent: useEffect");
    if (!activeRoom && !connecting) {
      console.log("IncomingVideoComponent: Should connect to Video Room");
      connectVideo();
    }
  }, []);

  function connectVideo() {
    console.log("task", task);
    console.log("task.attributes", task.attributes);
    console.log("task.attributes.syncDocument", task.attributes.syncDocument);
    if (task && task.attributes && task.attributes.syncDocument) {
      setConnecting(true);
      const body = {
        DocumentSid: task.attributes.syncDocument,
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
      };
      const options = {
        method: "POST",
        body: new URLSearchParams(body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      };
      fetch(`${BACKEND_URL}/3-agent-get-token`, options)
        .then((res) => res.json())
        .then((res) => {
          console.log("IncomingVideoComponent: got token: ", res.token);
          return Video.connect(res.token);
        })
        .then(roomJoined)
        .catch((err) => {
          alert(`Error joining video: ${err.message}`);
        })
        .finally(() => {
          setConnecting(false);
        });
    } else {
      alert(
        `Error joining video: the incoming task is invalid. Please send a new link to your client.`
      );
    }
  }

  // Attach the Remote Tracks to the DOM.
  function attachTracks(tracks: any, container: any) {
    tracks.forEach(function (track: any) {
      if (track.track) track = track.track;
      if (!track.attach) return;
      let trackDom = track.attach();
      trackDom.style.width = "auto";
      //   trackDom.style.position = "absolute";
      //   trackDom.style.top = "60px";
      //   trackDom.style.left = "10px";
      document.getElementById("remote-media")?.appendChild(trackDom);
    });
  }

  function attachLocalTracks(tracks: any, container: any) {
    if (!inSupervisor) {
      tracks.forEach(function (track: any) {
        if (track.track) track = track.track;
        let trackDom = track.attach();
        trackDom.style.maxWidth = "100%";
        trackDom.style["max-height"] = "150px";
        //trackDom.style.top = "200px";
        //trackDom.style.right = "0px";

        //trackDom.style.position = "relative";
        document.getElementById("local-media")?.appendChild(trackDom);
      });
    } else {
      tracks.forEach(function (track: any) {
        if (track.track) track = track.track;
        let trackDom = track.attach();
        trackDom.style.width = "100%";
        trackDom.style["max-height"] = "100px";
        //container.appendChild(trackDom);
        document.getElementById("local-media")?.appendChild(trackDom);
      });
    }
  }

  // Detach the Tracks from the DOM.
  function detachTracks(tracks: any) {
    tracks.forEach(function (track: any) {
      if (track.track) track = track.track;
      if (!track.detach) return;
      track.detach().forEach(function (detachedElement: any) {
        detachedElement.remove();
      });
    });
  }

  function roomJoined(room: any) {
    console.log("IncomingVideoComponent: room joined: ", room);
    setActiveRoom(room);

    // Save the local audio/video tracks in state so we can easily mute later
    Array.from(room.localParticipant.tracks.values()).forEach((track: any) => {
      if (track.kind === "audio") {
        setLocalAudio(track.track);
      } else {
        setLocalVideo(track.track);
      }
    });

    // add local tracks to the screen
    attachLocalTracks(
      Array.from(room.localParticipant.tracks.values()),
      remoteMediaDiv
    );

    room.localParticipant.on("trackEnabled", (track: any) => {
      console.log("enabled", track);
      if (track === localAudio) {
        setAudioEnabled(true);
      } else if (track === localVideo) {
        setVideoEnabled(true);
      }
    });

    room.localParticipant.on("trackDisabled", (track: any) => {
      console.log("disabled", track);
      if (track === localAudio) {
        setAudioEnabled(false);
      } else if (track === localVideo) {
        setVideoEnabled(false);
      }
    });

    // add existing participant tracks
    room.participants.forEach((participant: any) => {
      console.log(
        `IncomingVideoComponent: ${participant.identity} is already in the room}`
      );
      const tracks = Array.from(participant.tracks.values());
      attachTracks(tracks, remoteMediaDiv);
    });

    // When a Participant joins the Room
    room.on("participantConnected", (participant: any) => {
      console.log(
        `IncomingVideoComponent: ${participant.identity} joined the room}`
      );
    });

    // when a participant adds a track, attach it
    room.on(
      "trackSubscribed",
      (track: any, publication: any, participant: any) => {
        console.log(
          `IncomingVideoComponent: ${participant.identity} added track: ${track.kind}`
        );
        attachTracks([track], remoteMediaDiv);
      }
    );

    // When a Participant removes a Track, detach it from the DOM.
    room.on(
      "trackUnsubscribed",
      (track: any, publication: any, participant: any) => {
        console.log(
          `IncomingVideoComponent: ${participant.identity} removed track: ${track.kind}`
        );
        detachTracks([track]);
      }
    );

    // When a Participant leaves the Room
    room.on("participantDisconnected", (participant: any) => {
      console.log(
        `IncomingVideoComponent: ${participant.identity} left the room`
      );
    });

    // Room disconnected
    room.on("disconnected", () => {
      console.log("IncomingVideoComponent: disconnected");
    });
  }

  function mute() {
    console.log("mute clicked");
    if (localAudio) {
      localAudio.disable();
      setAudioEnabled(false);
    }
  }

  function unMute() {
    console.log("unmute clicked");

    localAudio?.enable();
    setAudioEnabled(true);
  }

  function videoOn() {
    if (localVideo) {
      localVideo.enable();
      setVideoEnabled(true);
    }
  }

  function videoOff() {
    if (localVideo) {
      localVideo?.disable();
      setVideoEnabled(false);
    }
  }

  function disconnect() {
    if (activeRoom) {
      activeRoom.disconnect();
      // TODO: bind in clearVideo functionality from state management
      //this.props.clearVideo();
      setActiveRoom(null);
    }
  }

  // TODO: screenshare needs to be looked at in depth
  /*function getScreenShare() {
    if (navigator.mediaDevices) { // supported by Chrome (72+), Firefox (66+), Safari (12.2+)
      return navigator.mediaDevices.getDisplayMedia({ video: true });
    } else {
      return navigator.mediaDevices.getUserMedia({
        video: { mediaSource: 'screen' },
      });
    }
  }

  function screenShareOn() {
    getScreenShare().then((stream: any) => {
      let screenTrack = stream.getVideoTracks()[0];
      activeRoom.localParticipant.publishTrack(screenTrack, { name: `screen-${Date.now()}` });
      setScreenTrack(screenTrack);
    });
  }

  function screenShareOff() {
    activeRoom?.localParticipant.unpublishTrack(screenTrack);
    setScreenTrack(null);
  }*/

  let containerStyle = inSupervisor
    ? supervisorContainerStyle
    : taskContainerStyle;

  if (!task) return null;
  else {
    return (
      <Theme.Provider theme="default">
        {activeRoom ? (
          <FlexPaste vertical>
            {/* <div style={containerStyle}> */}

            <FlexPaste vertical hAlignContent="center" width={"100%"}>
              <div id="remote-media" style={mediaTrackContainer}></div>
              <div style={btnRow}>
                <div style={btnContainer}>
                  <Tooltip text="Disconnect" placement="top">
                    <Button
                      variant="destructive"
                      size="icon"
                      style={btn}
                      onClick={disconnect}
                    >
                      <CloseIcon decorative={false} title="Disconnect" />
                    </Button>
                  </Tooltip>
                </div>
                {/*screenTrack && screenTrack.isEnabled ? (
                <div style={btnContainer}>
                  <Tooltip text="Stop Screenshare" placement="top">
                    <IconButton
                      icon={<StopScreenShareIcon />}
                      style={btn}
                      onClick={this.screenShareOff.bind(this)}
                    />
                  </Tooltip>
                </div>
              ) : (
                <div style={btnContainer}>
                  <Tooltip text="Start Screenshare" placement="top">
                    <IconButton
                      icon={<ScreenShareIcon />}
                      style={btn}
                      onClick={this.screenShareOn.bind(this)}
                    />
                  </Tooltip>
                </div>
              )*/}
                {audioEnabled ? (
                  <div style={btnContainer}>
                    <Tooltip text="Mute" placement="top">
                      <Button
                        variant="primary"
                        size="icon"
                        style={btn}
                        onClick={mute}
                      >
                        <MicrophoneOnIcon decorative={false} title="Mute" />
                      </Button>
                    </Tooltip>
                  </div>
                ) : (
                  <div style={btnContainer}>
                    <Tooltip text="Unmute" placement="top">
                      <Button
                        variant="primary"
                        size="icon"
                        style={btn}
                        onClick={unMute}
                      >
                        <MicrophoneOffIcon decorative={false} title="Unmute" />
                      </Button>
                    </Tooltip>
                  </div>
                )}
                {videoEnabled ? (
                  <div style={btnContainer}>
                    <Tooltip text="Stop Camera" placement="top">
                      <Button
                        variant="primary"
                        size="icon"
                        style={btn}
                        onClick={videoOff}
                      >
                        <VideoOnIcon decorative={false} title="Stop Camera" />
                      </Button>
                    </Tooltip>
                  </div>
                ) : (
                  <div style={btnContainer}>
                    <Tooltip text="Start Camera" placement="top">
                      <Button
                        variant="primary"
                        size="icon"
                        style={btn}
                        onClick={videoOn}
                      >
                        <VideoOffIcon decorative={false} title="Start Camera" />
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div id="local-media" style={mediaTrackContainer}></div>
            </FlexPaste>

            {/* {VIDEO_APP_URL ? (
              <div style={btnVideoAppRow}>
                <Button
                  style={btnVideoApp}
                  //onClick={openVideoApp}
                  variant="primary"
                >
                  Pop Out
                  <LinkExternalIcon decorative={true} style={btnVideoAppIcon} />
                </Button>
              </div>
            ) : null} */}
            {/* </div> */}
          </FlexPaste>
        ) : (
          <div style={containerStyle}>
            {connecting ? (
              <p>Connecting...</p>
            ) : (
              <FlexPaste padding="space50">
                <Button variant="primary" onClick={connectVideo}>
                  🎥&nbsp; Join Video Room
                </Button>
              </FlexPaste>
            )}
          </div>
        )}
      </Theme.Provider>
    );
  }
};

IncomingVideoComponent.displayName = "IncomingVideoComponent";

export default withTaskContext(IncomingVideoComponent);
