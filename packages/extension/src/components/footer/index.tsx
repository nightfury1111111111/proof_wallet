import React, { FunctionComponent } from "react";
import { useHistory, useLocation } from "react-router";

import classmames from "classnames";
import style from "./style.module.scss";

// interface Props {
//   icon: string;
//   logo: string;
//   subtitle: string;
// }

export const Footer: FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  return (
    <div className={classmames(style.footerContainer)}>
      <img
        src={
          location.pathname === "/"
            ? require("../../public/assets/img/main-active.svg")
            : require("../../public/assets/img/main.svg")
        }
        className={style.footerIcon}
        onClick={() => {
          history.push("/");
        }}
      />
      <img
        src={require("../../public/assets/img/trade.svg")}
        className={style.footerIcon}
      />
      <img
        src={
          location.pathname === "/nft"
            ? require("../../public/assets/img/nft-active.svg")
            : require("../../public/assets/img/nft.svg")
        }
        className={style.footerIcon}
        onClick={() => {
          history.push("/nft");
        }}
      />
      <img
        src={
          location.pathname === "/history"
            ? require("../../public/assets/img/history-active.svg")
            : require("../../public/assets/img/history.svg")
        }
        className={style.footerIcon}
        onClick={() => {
          history.push("/history");
        }}
      />
    </div>
  );
};
