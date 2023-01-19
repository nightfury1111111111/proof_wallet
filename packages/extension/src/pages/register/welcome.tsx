import React, { FunctionComponent, useEffect } from "react";
import Lottie from "react-lottie";

import {
  GetAutoLockAccountDurationMsg,
  UpdateAutoLockAccountDurationMsg,
} from "@proof-wallet/background/src/auto-lock-account";
import { InExtensionMessageRequester } from "@proof-wallet/router-extension";
import { BACKGROUND_PORT } from "@proof-wallet/router";

import styleWelcome from "./welcome.module.scss";
import { Button } from "reactstrap";

export const WelcomePage: FunctionComponent = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: require("../../public/assets/onboard-animation.json"),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    // set the lock time as 30 min
    const msg = new GetAutoLockAccountDurationMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then(function (duration) {
        console.log("duration", duration);
        if (duration === 0) {
          const updateMsg = new UpdateAutoLockAccountDurationMsg(30 * 60000);
          new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            updateMsg
          );
        }
      });
  }, []);

  // const intl = useIntl();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* <div className={styleWelcome.imagePad} /> */}
      <Lottie options={defaultOptions} height={230} width={424.82} />
      <div className={styleWelcome.content}>Your wallet is ready</div>
      <div className={styleWelcome.subContent}>
        You can now start using our position manager
      </div>
      <Button
        className={styleWelcome.launchBtn}
        type="submit"
        size="lg"
        onClick={() => {
          if (typeof browser !== "undefined") {
            browser.tabs.getCurrent().then((tab) => {
              if (tab.id) {
                browser.tabs.remove(tab.id);
              } else {
                window.close();
              }
            });
          } else {
            window.close();
          }
        }}
        block
      >
        Start trading
      </Button>
    </div>
  );
};
