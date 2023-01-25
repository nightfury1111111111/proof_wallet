import { BACKGROUND_PORT } from "@proof-wallet/router";
import { InExtensionMessageRequester } from "@proof-wallet/router-extension";
import React, { FunctionComponent } from "react";
import { URLTempAllowMsg } from "@proof-wallet/background";
import ReactDOM from "react-dom";
import style from "./style.module.scss";

export const BlocklistPage: FunctionComponent = () => {
  const origin =
    new URLSearchParams(window.location.search).get("origin") || "";

  const handleMove = () =>
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new URLTempAllowMsg(origin))
      .then(() => {
        window.location.replace(origin);
      });

  return (
    <div className={style.container}>
      <div className={style.inner}>
        <img
          className={style.image}
          src={require("../../public/assets/img/blocklist.svg")}
          alt=""
        />
        <div>
          <h1 className={style.title}>SECURITY ALERT</h1>
          <p className={style.description}>
            Proof has detected that this domain has been flagged as a phishing
            site. To protect the safety of your assets, we recommend you exit
            this website immediately.
          </p>
          <button className={style.link} onClick={handleMove}>
            Continue to {origin} (unsafe)
          </button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
