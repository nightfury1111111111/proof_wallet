import React, { FunctionComponent } from "react";

import classmames from "classnames";
import style from "./style.module.scss";

// interface Props {
//   icon: string;
//   logo: string;
//   subtitle: string;
// }

export const Footer: FunctionComponent = () => {
  return (
    <div className={classmames(style.footerContainer)}>
      <img
        src={require("../../public/assets/img/main.svg")}
        className={style.footerIcon}
      />
      <img
        src={require("../../public/assets/img/trade.svg")}
        className={style.footerIcon}
      />
      <img
        src={require("../../public/assets/img/nft.svg")}
        className={style.footerIcon}
      />
      <img
        src={require("../../public/assets/img/history.svg")}
        className={style.footerIcon}
      />
    </div>
  );
};
