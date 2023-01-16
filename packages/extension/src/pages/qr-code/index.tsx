import React, { FunctionComponent, useRef, useEffect, useState } from "react";
import { HeaderLayout } from "../../layouts";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useStore } from "../../stores";
import { WalletStatus } from "@proof-wallet/stores";
import { createShortenName } from "../main/account";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QrCode = require("qrcode");

export const DepositPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (qrCodeRef.current && accountInfo.bech32Address) {
      QrCode.toCanvas(qrCodeRef.current, accountInfo.bech32Address);
    }
  }, [accountInfo]);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [isCopied]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      style={{ height: "auto", minHeight: "100%" }}
      onBackButton={() => {
        history.goBack();
      }}
      rightRenderer={
        <div
          style={{
            height: "36px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <div
            style={{
              background:
                "radial-gradient(75% 75% at 50% 25%, #C4FFD1 3.88%, #7EFF9B 100%)", // if it is connected, green color if not, red
              width: "5px",
              height: "5px",
              borderRadius: "10px",
              cursor: "pointer",
              padding: "4px",
            }}
          />
        </div>
      }
    >
      <div className={style.depositContainer}>
        <canvas className={style.qrcode} id="qrcode" ref={qrCodeRef} />
        <div className={style.rawAddress}>
          <div className={style.title}>
            {accountInfo.walletStatus === WalletStatus.Loaded && (
              <div className={style.avatar} style={{ background: "#FFD48A" }}>
                {createShortenName(accountInfo.name)}
              </div>
            )}
            {accountInfo.walletStatus === WalletStatus.Loaded
              ? accountInfo.name ||
                intl.formatMessage({
                  id: "setting.keyring.unnamed-account",
                })
              : accountInfo.walletStatus === WalletStatus.Rejected
              ? "Unable to Load Key"
              : "Loading..."}
          </div>
          <div className={style.body}>
            {accountInfo.bech32Address}{" "}
            <img
              style={{ width: "13px", height: "13px" }}
              src={require("../../public/assets/img/copy-icon.svg")}
              onClick={async () => {
                await navigator.clipboard.writeText(accountInfo.bech32Address);
                setIsCopied(true);
              }}
            />
          </div>
          {isCopied && (
            <div className={style.copied}>
              Copied
              <i
                key="selected"
                className="fas fa-check"
                style={{ color: "#000000", marginLeft: "7px" }}
              />
            </div>
          )}
        </div>
        <div className={style.description}>
          Make sure you send{" "}
          <span style={{ fontWeight: "bold" }}>compatible tokens</span> on the
          SEI chain or they will be lost forever
        </div>
        <div className={style.footer}>
          <div
            className={style.closeButton}
            onClick={() => {
              history.push("/");
            }}
          >
            Close
          </div>
        </div>
      </div>
    </HeaderLayout>
  );
});
