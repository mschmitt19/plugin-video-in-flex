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
      if: (props: any) => props.task.attributes.videoRoom === "created",
    };

    flex.TaskCanvasTabs.Content.add(
      <Flex.Tab label="Video Room" key="IncomingVideoComponent">
        <IncomingVideoComponent manager={manager} inSupervisor={false} />
      </Flex.Tab>,
      incomingVideoOptions
    );

    // add the Agent "switch to video" button
    flex.TaskCanvasHeader.Content.add(
      <SwitchToVideo key="video" flex={flex} />
    );
  }
}
