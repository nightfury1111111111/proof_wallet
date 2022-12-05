import React, { FunctionComponent } from "react";
import { useHistory } from "react-router";

import classmames from "classnames";
import style from "./style.module.scss";

// interface Props {
//   icon: string;
//   logo: string;
//   subtitle: string;
// }

export const Footer: FunctionComponent = () => {
  const history = useHistory();
  return (
    <div className={classmames(style.footerContainer)}>
      <img
        src={require("../../public/assets/img/main.svg")}
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
        src={require("../../public/assets/img/nft.svg")}
        className={style.footerIcon}
        onClick={() => {
          history.push("/nft");
        }}
      />
      <img
        src={require("../../public/assets/img/history.svg")}
        className={style.footerIcon}
      />
    </div>
  );
};
