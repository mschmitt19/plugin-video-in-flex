import React, { useState } from "react";
import { Actions, TaskContext } from "@twilio/flex-ui";
import { Flex as FlexComponent } from "@twilio-paste/core/flex";
import { Button } from "@twilio-paste/core/button";
import { Theme } from "@twilio-paste/core/theme";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import { updateTaskAttributesForVideo } from "../../shared/utils";

interface SwitchToVideoProps {
  task?: any;
}

const SwitchToVideo: React.FunctionComponent<SwitchToVideoProps> = ({
  task,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async (channelSid: string | undefined, context: any) => {
    setIsLoading(true);
    const taskSid = context.task._task.sid;

    fetch(
      `${process.env.REACT_APP_VIDEO_APP_URL}/1-generate-unique-code?taskSid=${taskSid}`
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("SwitchToVideo: unique link created:", response);
        return Actions.invokeAction("SendMessage", {
          body: `Please join me using this unique video link: ${response.full_url}`,
          conversationSid: channelSid,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    updateTaskAttributesForVideo(task, "created");
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
