import React, { FunctionComponent } from "react";
import Lottie from "react-lottie";

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

  // const intl = useIntl();

  return (
    <div
      style={{
        paddingTop: "20px",
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
