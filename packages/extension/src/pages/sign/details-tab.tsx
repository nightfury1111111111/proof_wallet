import React, { FunctionComponent, useState, useMemo, useEffect } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Hash } from "@proof-wallet/crypto";

import styleDetailsTab from "./details-tab.module.scss";

import { renderAminoMessage } from "./amino";
import { Msg } from "@proof-wallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeButtons } from "../../components/form";
import {
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  SignDocHelper,
} from "@proof-wallet/hooks";
import { useLanguage } from "../../languages";
import { Button } from "reactstrap";
import { renderDirectMessage } from "./direct";
import { AnyWithUnpacked } from "@proof-wallet/cosmos";
import { CoinPretty } from "@proof-wallet/unit";
import { Currency } from "@proof-wallet/types";
import { StoreUtils } from "@proof-wallet/stores";
import { NftList } from "../../config";

export const DetailsTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  isInternal: boolean;

  preferNoSetFee: boolean;
  preferNoSetMemo: boolean;

  isNeedLedgerEthBlindSigning: boolean;
}> = observer(
  ({
    signDocHelper,
    // memoConfig,
    feeConfig,
    gasConfig,
    isInternal,
    preferNoSetFee,
    // preferNoSetMemo,
    isNeedLedgerEthBlindSigning,
  }) => {
    const [backgroundColors] = useState([
      "#5e72e4",
      "#11cdef",
      "#2dce89",
      "#fb6340",
    ]);

    const [originUrl, setOriginUrl] = useState("");

    const {
      chainStore,
      priceStore,
      accountStore,
      signInteractionStore,
    } = useStore();
    const current = chainStore.current;
    const currenciesMap = current.currencies.reduce<{
      [denom: string]: Currency;
    }>((obj, currency) => {
      // TODO: Handle the contract tokens.
      if (!("type" in currency)) {
        obj[currency.coinMinimalDenom] = currency;
      }
      return obj;
    }, {});

    const intl = useIntl();
    const language = useLanguage();

    useEffect(() => {
      if (signInteractionStore.waitingData)
        setOriginUrl(signInteractionStore.waitingData.data.msgOrigin);
    }, [signInteractionStore]);

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(msgs[0]);

    const currentNft =
      !msgs[0].value.amount &&
      msgs[0].value.msg &&
      Object.keys(msgs[0].value.msg)[0] === "transfer_nft" &&
      NftList.filter((nft) => {
        return nft.address === msgs[0].value.contract;
      })[0];

    const currentCoin =
      !msgs[0].value.amount &&
      msgs[0].value.msg &&
      Object.keys(msgs[0].value.msg)[0] === "transfer_nft"
        ? StoreUtils.getBalancesFromCurrencies(currenciesMap, [
            { denom: "usei", amount: "1000000" },
          ])
        : isInternal
        ? StoreUtils.getBalancesFromCurrencies(
            currenciesMap,
            msgs[0].value.amount
          )
        : StoreUtils.getBalancesFromCurrencies(currenciesMap, [
            { denom: "usei", amount: "1000000" },
          ]);

    const balance = currentCoin[0].trim(true).shrink(true);
    const name =
      Object.keys(balance).length > 0
        ? balance.currency.coinDenom.toUpperCase()
        : "NFT";
    const imageUrl =
      currentNft &&
      !msgs[0].value.amount &&
      Object.keys(msgs[0].value.msg)[0] === "transfer_nft"
        ? `${currentNft.apiEndpoint}images/${msgs[0].value.msg.transfer_nft.token_id}.${currentNft.ext}`
        : Object.keys(balance.currency).indexOf("coinImageUrl") > -1
        ? balance.currency.coinImageUrl
        : "";

    const minimalDenom =
      Object.keys(balance).length > 0
        ? balance.currency.coinMinimalDenom
        : "NFT";

    const backgroundColor = useMemo(() => {
      if (Object.keys(balance).length === 0) return "#D9D9D9";
      const hash = Hash.sha256(Buffer.from(minimalDenom));
      if (hash.length > 0) {
        return backgroundColors[hash[0] % backgroundColors.length];
      } else {
        return backgroundColors[0];
      }
    }, [backgroundColors, minimalDenom]);

    const renderedMsgs = (() => {
      if (mode === "amino") {
        return (msgs as readonly Msg[]).map((msg, i) => {
          const msgContent = renderAminoMessage(
            accountStore.getAccount(chainStore.current.chainId),
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <MsgRender icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </MsgRender>
              <hr />
            </React.Fragment>
          );
        });
      } else if (mode === "direct") {
        return (msgs as AnyWithUnpacked[]).map((msg, i) => {
          const msgContent = renderDirectMessage(
            msg,
            chainStore.current.currencies,
            intl
          );
          return (
            <React.Fragment key={i.toString()}>
              <MsgRender icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </MsgRender>
              <hr />
            </React.Fragment>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <div className={styleDetailsTab.container}>
        {/* <Label
          for="signing-messages"
          className="form-control-label"
          style={{ display: "flex" }}
        >
          <FormattedMessage id="sign.list.messages.label" />
          <Badge className="ml-2" color="primary">
            {msgs.length}
          </Badge>
        </Label> */}
        {isInternal && (
          <div id="signing-messages" className={styleDetailsTab.msgContainer}>
            {imageUrl === "" ? (
              <div
                className={styleDetailsTab.tokenIcon}
                style={{ backgroundColor }}
              >
                <img
                  className={styleDetailsTab.subIcon}
                  src={require("../../public/assets/img/send.svg")}
                />
                {name.length > 0 ? name[0] : "?"}
              </div>
            ) : (
              <div
                className={styleDetailsTab.tokenIcon}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                }}
              >
                <img
                  className={styleDetailsTab.subIcon}
                  src={require("../../public/assets/img/send.svg")}
                />
              </div>
            )}
            {renderedMsgs}
          </div>
        )}

        {!isInternal && (
          <div className={styleDetailsTab.siteInfo}>
            <img
              alt="unlink"
              src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${originUrl}&size=64`}
              className={styleDetailsTab.icon}
            />
            <h1 className={styleDetailsTab.header}>Approve Transaction</h1>
            <p className={styleDetailsTab.paragraph}>
              {/* <FormattedMessage
            id="access.paragraph"
            values={{
              host,
              chainId: chainIds,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>,
            }}
          /> */}
              {originUrl}
            </p>
          </div>
        )}

        {/* <div style={{ flex: 1 }} /> */}
        {/* {!preferNoSetMemo ? (
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "sign.info.memo" })}
            rows={1}
          />
        ) : (
          <React.Fragment>
            <Label for="memo" className="form-control-label">
              <FormattedMessage id="sign.info.memo" />
            </Label>
            <div id="memo" style={{ marginBottom: "8px" }}>
              <div style={{ color: memoConfig.memo ? undefined : "#AAAAAA" }}>
                {memoConfig.memo
                  ? memoConfig.memo
                  : intl.formatMessage({ id: "sign.info.warning.empty-memo" })}
              </div>
            </div>
          </React.Fragment>
        )} */}
        {!preferNoSetFee || !feeConfig.isManual ? (
          <FeeButtons
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            priceStore={priceStore}
            label={intl.formatMessage({ id: "sign.info.fee" })}
            gasLabel={intl.formatMessage({ id: "sign.info.gas" })}
            showFeeCurrencySelectorUnderSetGas={true}
          />
        ) : (
          <React.Fragment>
            {/* <Label for="fee-price" className="form-control-label">
              <FormattedMessage id="sign.info.fee" />
            </Label> */}
            <div id="fee-price">
              <div>
                {(() => {
                  // To modify the gas in the current component composition,
                  // the fee buttons component should be shown.
                  // However, if the fee amount is an empty array, the UI to show is ambiguous.
                  // Therefore, if the fee amount is an empty array, it is displayed as 0 fee in some asset.
                  const feeOrZero =
                    feeConfig.fee ??
                    (() => {
                      if (chainStore.current.feeCurrencies.length === 0) {
                        return new CoinPretty(
                          chainStore.current.stakeCurrency,
                          "0"
                        );
                      }

                      return new CoinPretty(
                        chainStore.current.feeCurrencies[0],
                        "0"
                      );
                    })();

                  return (
                    <React.Fragment>
                      <div className={styleDetailsTab.feeContainer}>
                        <div style={{ color: "#696969" }}>Network fees</div>
                        <div style={{ color: "#ffffff" }}>
                          {feeOrZero.maxDecimals(6).trim(true).toString()}
                          {priceStore.calculatePrice(
                            feeOrZero,
                            language.fiatCurrency
                          ) ? (
                            <div
                              className="ml-2"
                              style={{
                                display: "inline-block",
                                fontSize: "12px",
                              }}
                            >
                              {priceStore
                                .calculatePrice(
                                  feeOrZero,
                                  language.fiatCurrency
                                )
                                ?.toString()}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })()}
              </div>
            </div>
            {
              /*
                Even if the "preferNoSetFee" option is turned on, it provides the way to edit the fee to users.
                However, if the interaction is internal, you can be sure that the fee is set well inside Proof.
                Therefore, the button is not shown in this case.
              */
              !isInternal ? (
                <div style={{ fontSize: "12px" }}>
                  <Button
                    color="link"
                    size="sm"
                    style={{
                      padding: 0,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      feeConfig.setFeeType("average");
                    }}
                  >
                    <FormattedMessage id="sign.info.fee.override" />
                  </Button>
                </div>
              ) : null
            }
          </React.Fragment>
        )}
        {isNeedLedgerEthBlindSigning ? (
          <div className={styleDetailsTab.ethLedgerBlindSigningWarning}>
            <div className={styleDetailsTab.title}>
              Before you click ‘Approve’
            </div>
            <ul className={styleDetailsTab.list}>
              <li>Connect your Ledger device and select the Ethereum app</li>
              <li>Enable ‘blind signing’ on your Ledger device</li>
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
);

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({
  // icon = "fas fa-question", title,
  children,
}) => {
  return (
    <div className={styleDetailsTab.msg}>
      {/* <div className={styleDetailsTab.icon}>
        <div style={{ height: "2px" }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div> */}
      <div className={styleDetailsTab.contentContainer}>
        {/* <div className={styleDetailsTab.contentTitle}>{title}</div> */}
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
