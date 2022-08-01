import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import SwitchToVideo from "./components/SwitchToVideo/SwitchToVideo";

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
    const options: Flex.ContentFragmentProps = { sortOrder: -1 };
    //flex.AgentDesktopView.Panel1.Content.add(<CustomTaskList key="TwilioVideoInFlexPlugin-component" />, options);
    // add the Agent "switch to video" button
    // flex.TaskCanvasHeader.Content.add(
    //   <SwitchToVideo key="video" flex={flex} />
    // );
    flex.CRMContainer.Content.add(<SwitchToVideo key="video" flex={flex} />);

    // flex.Actions.invokeAction("SendMessage", {
    //   body: `Test...`,
    //   channelSid: "CH5fc468e74bbb4024a8a66489e92c52d9",
    // });
  }
}
