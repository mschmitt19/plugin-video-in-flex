import React, { useState } from "react";
import { Actions, Manager, TaskContext } from "@twilio/flex-ui";
import * as Flex from "@twilio/flex-ui";
import { Flex as FlexComponent } from "@twilio-paste/core/flex";
import { Button } from "@twilio-paste/core/button";
import { Theme } from "@twilio-paste/core/theme";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";

interface SwitchToVideoProps {
  flex: any;
  task?: any;
}

const SwitchToVideo: React.FunctionComponent<SwitchToVideoProps> = ({
  flex,
  task,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  //   console.log(flex);
  //   console.log(task._task);
  const onClick = async (channelSid: string | undefined, context: any) => {
    // console.log(channelSid);
    // console.log(context);
    setIsLoading(true);
    console.log("video button clicked", process.env.REACT_APP_VIDEO_APP_URL);
    const taskSid = context.task._task.sid;
    const taskAttributes = context.task._task.attributes;
    console.log("taskSid", taskSid);
    console.log("taskAttributes", taskAttributes);
    fetch(
      `${process.env.REACT_APP_VIDEO_APP_URL}/1-generate-unique-code?taskSid=${taskSid}`
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("SwitchToVideo: unique link created:", response);
        console.log(task.attributes);
        return Actions.invokeAction("SendMessage", {
          body: `Please join me using this unique video link: ${response.full_url}`,
          conversationSid: channelSid,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    let attributes = task.attributes;
    let updatedAttributes = Object.assign(attributes, {
      videoRoom: "created",
    });
    task.setAttributes(updatedAttributes);
  };

  return (
    <TaskContext.Consumer>
      {(context) => (
        <>
          <Theme.Provider theme="default">
            <FlexComponent
              padding="space10"
              marginTop="space30"
              marginLeft={"space30"}
            >
              <Button
                variant="primary"
                onClick={async () =>
                  await onClick(context.conversation?.source?.sid, context)
                }
                loading={isLoading}
              >
                <VideoOnIcon
                  decorative
                  size="sizeIcon10"
                  title="Switch to Video"
                />
              </Button>
            </FlexComponent>
          </Theme.Provider>
        </>
      )}
    </TaskContext.Consumer>
  );
};

SwitchToVideo.displayName = "SwitchToVideo";

export default SwitchToVideo;
