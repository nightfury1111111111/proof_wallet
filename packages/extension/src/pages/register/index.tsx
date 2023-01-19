import React, { FunctionComponent, useEffect } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { Button } from "reactstrap";

// import { FormattedMessage } from "react-intl";

import { useRegisterConfig } from "@proof-wallet/hooks";
import { useStore } from "../../stores";
import { NewMnemonicIntro, NewMnemonicPage, TypeNewMnemonic } from "./mnemonic";
import {
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeRecoverMnemonic,
} from "./mnemonic";
// import {
//   ImportLedgerIntro,
//   ImportLedgerPage,
//   TypeImportLedger,
// } from "./ledger";
import { WelcomePage } from "./welcome";
import { AdditionalSignInPrepend } from "../../config.ui";
import classnames from "classnames";

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <div className={style.backButton}>
      <Button
        color="link"
        style={{ paddingLeft: 0, color: "#696969" }}
        onClick={onClick}
      >
        <i className="fas fa-arrow-left" style={{ marginRight: "8px" }} />
        {/* <FormattedMessage id="register.button.back" /> */}
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  useEffect(() => {
    document.documentElement.setAttribute("data-register-page", "true");

    return () => {
      document.documentElement.removeAttribute("data-register-page");
    };
  }, []);

  const { keyRingStore, uiConfigStore } = useStore();

  const registerConfig = useRegisterConfig(keyRingStore, [
    ...(AdditionalSignInPrepend ?? []),
    {
      type: TypeNewMnemonic,
      intro: NewMnemonicIntro,
      page: NewMnemonicPage,
    },
    {
      type: TypeRecoverMnemonic,
      intro: RecoverMnemonicIntro,
      page: RecoverMnemonicPage,
    },
    // Currently, there is no way to use ledger with keplr on firefox.
    // Temporarily, hide the ledger usage.
    // ...(uiConfigStore.platform !== "firefox"
    //   ? [
    //       {
    //         type: TypeImportLedger,
    //         intro: ImportLedgerIntro,
    //         page: ImportLedgerPage,
    //       },
    //     ]
    //   : []),
  ]);

  return (
    <EmptyLayout
      className={classnames(style.container, {
        large:
          !registerConfig.isFinalized &&
          registerConfig.type === "recover-mnemonic",
      })}
      style={{
        height: "100%",
        backgroundColor: "#131313",
        padding: 0,
      }}
    >
      {!registerConfig.isIntro && (
        <div className={style.edgeLogoContainer}>
          <div
            className={classnames(style.logoInnerContainer, {
              [style.justifyCenter]: registerConfig.isIntro,
            })}
          >
            <img
              className={style.icon}
              src={
                uiConfigStore.isBeta
                  ? require("../../public/assets/img/logo-title.svg")
                  : require("../../public/assets/img/logo-title.svg")
              }
              alt="logo"
            />
            {/* <div className={style.brandText}>Proof Wallet</div> */}
          </div>
        </div>
      )}
      <div style={{ flex: 10 }} />
      {registerConfig.isIntro && (
        <div className={style.logoContainer}>
          <div
            className={classnames(style.logoInnerContainer, {
              [style.justifyCenter]: registerConfig.isIntro,
            })}
          >
            <img
              className={style.icon}
              src={
                uiConfigStore.isBeta
                  ? require("../../public/assets/img/logo-title.svg")
                  : require("../../public/assets/img/logo-title.svg")
              }
              alt="logo"
            />
            {/* <div className={style.brandText}>Proof Wallet</div> */}
          </div>
          <div className={style.introBrandSubTextContainer}>
            The best way to experience your Defi & NFTs
          </div>
        </div>
      )}
      <div className={style.buttonContainer}>{registerConfig.render()}</div>
      {registerConfig.isFinalized ? <WelcomePage /> : null}
      {/* {registerConfig.isIntro ? (
        <div className={style.subContent}>
          <FormattedMessage
            id="register.intro.sub-content"
            values={{
              br: <br />,
            }}
          />
        </div>
      ) : null} */}
      <div style={{ flex: 10 }} />
    </EmptyLayout>
  );
});
