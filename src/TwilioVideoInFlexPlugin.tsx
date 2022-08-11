import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import SwitchToVideo from "./components/SwitchToVideo/SwitchToVideo";
import IncomingVideoComponent from "./components/IncomingVideoComponent/IncomingVideoComponent";

const PLUGIN_NAME = "TwilioVideoInFlexPlugin";

export default class TwilioVideoInFlexPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    const incomingVideoOptions = {
      sortOrder: 10,
      if: (props: any) => props.task.attributes.videoRoom !== undefined,
    };

    // add the Video Room tab to the chat conversation
    flex.TaskCanvasTabs.Content.add(
      <Flex.Tab label="Video Room" key="IncomingVideoComponent">
        <IncomingVideoComponent manager={manager} />
      </Flex.Tab>,
      incomingVideoOptions
    );

    // add the Agent "switch to video" button
    flex.TaskCanvasHeader.Content.add(<SwitchToVideo key="video" />);

    // add listener before task completion if it included video to check if the agent is still in the room
    // an alternative to this strategy would be to set the room status to "completed" on task completion to
    // ensure all participants are disconnected from the room
    flex.Actions.addListener(
      "beforeCompleteTask",
      async (payload, cancelActionInvocation) => {
        const { videoRoom } = payload.task.attributes;

        if (!Flex.TaskHelper.isChatBasedTask(payload.task) || !videoRoom) {
          console.log("not a chat task or didn't have video element");
          return payload;
        }

        if (videoRoom === "connected") {
          alert(
            "You are still connected to a video room. Please disconnect before completing the task."
          );
          cancelActionInvocation();
        }

        return payload;
      }
    );
  }
}
