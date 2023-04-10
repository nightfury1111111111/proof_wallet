import React, { FunctionComponent } from "react";

import style from "./style.module.scss";
import { PricePretty } from "@proof-wallet/unit";

interface Props {
  total: PricePretty;
}

export const PriceDisplay: FunctionComponent<Props> = (props: Props) => {
  return (
    <div className={style.priceWrap}>
      <div className={style.fiatSymbol}>{props.total.fiatCurrency.symbol}</div>
      <div className={style.price}>{props.total.toString().split("$")[1]}</div>
      <div className={style.decimals}>
        .{props.total.toDec().toString().split(".")[1].substring(0, 2)}
      </div>
    </div>
  );
};
