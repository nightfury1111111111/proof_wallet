import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
import { Button } from "reactstrap";

// import { useIntl } from "react-intl";

export const WelcomePage: FunctionComponent = () => {
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
      {/* <div className={styleWelcome.title}>
        {intl.formatMessage({
          id: "register.welcome.title",
        })}
      </div> */}
      <div className={styleWelcome.imagePad} />
      <div className={styleWelcome.content}>
        {/* {intl.formatMessage({
          id: "register.welcome.content",
        })} */}
        Your wallet is ready
      </div>
      <Button
        // color="primary"
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
        {/* {intl.formatMessage({
          id: "register.welcome.button.done",
        })} */}
        Start trading
      </Button>
    </div>
  );
};
