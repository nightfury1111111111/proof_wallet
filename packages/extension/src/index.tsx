import React, { FunctionComponent, useEffect } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./languages";

import "./styles/global.scss";

import { HashRouter, Route } from "react-router-dom";

import { AccessPage, Secret20ViewingKeyAccessPage } from "./pages/access";
import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";
import { SendPage } from "./pages/send";
import { SendNftPage } from "./pages/send-nft";
import { SelectTokenPage } from "./pages/selectToken";
import { ManageNftPage } from "./pages/nft";
import { IBCTransferPage } from "./pages/ibc-transfer";
import { SetKeyRingPage } from "./pages/setting/keyring";
import { ChangePassword } from "./pages/change-password";
import { ResetSeedPage } from "./pages/setting/reset-seed";

import { Banner } from "./components/banner";

import {
  NotificationProvider,
  NotificationStoreProvider,
} from "./components/notification";
import { ConfirmProvider } from "./components/confirm";
import { LoadingIndicatorProvider } from "./components/loading-indicator";

import { configure } from "mobx";
import { observer } from "mobx-react-lite";

import { StoreProvider, useStore } from "./stores";
import {
  KeyRingStatus,
  StartAutoLockMonitoringMsg,
} from "@proof-wallet/background";
import { SignPage } from "./pages/sign";
import { ChainSuggestedPage } from "./pages/chain/suggest";
import Modal from "react-modal";
import { SettingPage } from "./pages/setting";
import { SettingLanguagePage } from "./pages/setting/language";
import { SettingFiatPage } from "./pages/setting/fiat";
import {
  SettingConnectionsPage,
  SettingSecret20ViewingKeyConnectionsPage,
} from "./pages/setting/connections";
import { AddressBookPage } from "./pages/setting/address-book";
import { CreditPage } from "./pages/setting/credit";
import { ChangeNamePage } from "./pages/setting/keyring/change";
import { ClearPage } from "./pages/setting/clear";
import { ExportPage } from "./pages/setting/export";
import { LedgerGrantPage } from "./pages/ledger";
import { AddTokenPage } from "./pages/setting/token/add";
import { ManageTokenPage } from "./pages/setting/token/manage";
import { HistoryPage } from "./pages/history";
import { DepositPage } from "./pages/qr-code";
// import * as BackgroundTxResult from "../../background/tx/foreground";
import { AdditionalIntlMessages, LanguageToFiatCurrency } from "./config.ui";

import manifest from "./manifest.json";
import { Proof } from "@proof-wallet/provider";
import { InExtensionMessageRequester } from "@proof-wallet/router-extension";
import { ExportToMobilePage } from "./pages/setting/export-to-mobile";
import { LogPageViewWrapper } from "./components/analytics";
import { SettingEndpointsPage } from "./pages/setting/endpoints";
import { SettingAutoLockPage } from "./pages/setting/autolock";
import { BACKGROUND_PORT } from "@proof-wallet/router";

window.proof = new Proof(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

// Make sure that icon file will be included in bundle
require("./public/assets/256.png");
require("./public/assets/icon/16.png");
require("./public/assets/icon/48.png");
require("./public/assets/icon/128.png");
require("./public/assets/icon/icon-beta-16.png");
require("./public/assets/icon/icon-beta-48.png");
require("./public/assets/icon/icon-beta-128.png");

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay,
  },
};

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  useEffect(() => {
    // Notify to auto lock service to start activation check whenever the keyring is unlocked.
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      const msg = new StartAutoLockMonitoringMsg();
      const requester = new InExtensionMessageRequester();
      requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }, [keyRingStore.status]);

  if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
    return <MainPage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    window.close();
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={"https://proofwalletsvgs.s3.amazonaws.com/logo.svg"}
          logo={require("./public/assets/brand-text.png")}
          title="Welcome Back"
          subtitle="Unlock your wallet to continue"
        />
      </div>
    );
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={"https://proofwalletsvgs.s3.amazonaws.com/logo.svg"}
          logo={require("./public/assets/brand-text.png")}
          title="Welcome Back"
          subtitle="Unlock your wallet to continue"
        />
      </div>
    );
  } else {
    return <div>Unknown status</div>;
  }
});

ReactDOM.render(
  <StoreProvider>
    <AppIntlProvider
      additionalMessages={AdditionalIntlMessages}
      languageToFiatCurrency={LanguageToFiatCurrency}
    >
      <LoadingIndicatorProvider>
        <NotificationStoreProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <HashRouter>
                <LogPageViewWrapper>
                  <Route exact path="/" component={StateRenderer} />
                  <Route exact path="/unlock" component={LockPage} />
                  <Route exact path="/access-wallet" component={AccessPage} />
                  <Route
                    exact
                    path="/access/viewing-key"
                    component={Secret20ViewingKeyAccessPage}
                  />
                  <Route exact path="/deposit" component={DepositPage} />
                  <Route exact path="/register" component={RegisterPage} />
                  <Route exact path="/send" component={SendPage} />
                  <Route exact path="/send-nft" component={SendNftPage} />
                  <Route exact path="/nft" component={ManageNftPage} />
                  <Route
                    exact
                    path="/select/token"
                    component={SelectTokenPage}
                  />
                  <Route
                    exact
                    path="/ibc-transfer"
                    component={IBCTransferPage}
                  />
                  <Route exact path="/setting" component={SettingPage} />
                  <Route
                    exact
                    path="/ledger-grant"
                    component={LedgerGrantPage}
                  />
                  <Route
                    exact
                    path="/setting/language"
                    component={SettingLanguagePage}
                  />
                  <Route
                    exact
                    path="/setting/fiat"
                    component={SettingFiatPage}
                  />
                  <Route
                    exact
                    path="/setting/connections"
                    component={SettingConnectionsPage}
                  />
                  <Route
                    exact
                    path="/setting/connections/viewing-key/:contractAddress"
                    component={SettingSecret20ViewingKeyConnectionsPage}
                  />
                  <Route
                    exact
                    path="/setting/address-book"
                    component={AddressBookPage}
                  />
                  <Route
                    exact
                    path="/setting/export-to-mobile"
                    component={ExportToMobilePage}
                  />
                  <Route exact path="/setting/credit" component={CreditPage} />
                  <Route
                    exact
                    path="/setting/set-keyring"
                    component={SetKeyRingPage}
                  />
                  <Route
                    exact
                    path="/setting/change-password"
                    component={ChangePassword}
                  />
                  <Route
                    exact
                    path="/setting/reset-seed"
                    component={ResetSeedPage}
                  />
                  <Route
                    exact
                    path="/setting/export/:index"
                    component={ExportPage}
                  />
                  <Route
                    exact
                    path="/setting/clear/:index"
                    component={ClearPage}
                  />
                  <Route
                    exact
                    path="/setting/keyring/change/name/:index"
                    component={ChangeNamePage}
                  />
                  <Route
                    exact
                    path="/setting/token/add"
                    component={AddTokenPage}
                  />
                  <Route
                    exact
                    path="/setting/token/manage"
                    component={ManageTokenPage}
                  />
                  <Route
                    exact
                    path="/setting/endpoints"
                    component={SettingEndpointsPage}
                  />
                  <Route
                    exact
                    path="/setting/autolock"
                    component={SettingAutoLockPage}
                  />
                  <Route exact path="/history" component={HistoryPage} />
                  <Route path="/sign" component={SignPage} />
                  <Route path="/suggest-chain" component={ChainSuggestedPage} />
                </LogPageViewWrapper>
              </HashRouter>
            </ConfirmProvider>
          </NotificationProvider>
        </NotificationStoreProvider>
      </LoadingIndicatorProvider>
    </AppIntlProvider>
  </StoreProvider>,
  document.getElementById("app")
);
