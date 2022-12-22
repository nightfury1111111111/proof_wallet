import React, { FunctionComponent } from "react";

import styleMenu from "./menu.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { useLanguage } from "../../languages";

export const Menu: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();
  const language = useLanguage();

  const history = useHistory();

  return (
    <div className={styleMenu.container}>
      <div
        className={styleMenu.item}
        onClick={() => {
          history.push({
            pathname: "/setting/address-book",
          });
        }}
      >
        <FormattedMessage id="main.menu.address-book" />
        <div>
          <img
            style={{ width: "6.5px", height: "13px" }}
            src={require("../../public/assets/img/right-caret.svg")}
          />
        </div>
      </div>
      <div
        className={styleMenu.item}
        onClick={() => {
          history.push({
            pathname: "/setting/language",
          });
        }}
      >
        <FormattedMessage id="setting.language" />
        <div
          style={{ display: "flex", alignItems: "center", color: "#696969" }}
        >
          <FormattedMessage id={`setting.language.${language.language}`} />
          <img
            style={{ width: "6.5px", height: "13px", marginLeft: "10px" }}
            src={require("../../public/assets/img/right-caret.svg")}
          />
        </div>
      </div>
      <div
        className={styleMenu.item}
        onClick={() => {
          history.push({
            pathname: "/setting",
          });
        }}
      >
        <div>Setting & Security</div>
        <div>
          <img
            style={{ width: "6.5px", height: "13px" }}
            src={require("../../public/assets/img/right-caret.svg")}
          />
        </div>
      </div>
      <div
        className={styleMenu.item}
        onClick={() => {
          history.push({
            pathname: "/setting/connections",
          });
        }}
      >
        <FormattedMessage id="setting.connections" />
        <div>
          <img
            style={{ width: "6.5px", height: "13px" }}
            src={require("../../public/assets/img/right-caret.svg")}
          />
        </div>
      </div>
      {/* <div
        className={styleMenu.item}
        onClick={() => {
          history.push("/setting/set-keyring");
        }}
      >
        <FormattedMessage id="setting.keyring" />
        <div>
          <img
            style={{ width: "6.5px", height: "13px" }}
            src={require("../../public/assets/img/right-caret.svg")}
          />
        </div>
      </div> */}
      {(chainStore.current.features ?? []).find(
        (feature) => feature === "cosmwasm" || feature === "secretwasm"
      ) ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            history.push({
              pathname: "/setting/token/add",
            });
          }}
        >
          <FormattedMessage id="setting.token.add" />
          <div>
            <img
              style={{ width: "6.5px", height: "13px" }}
              src={require("../../public/assets/img/right-caret.svg")}
            />
          </div>
        </div>
      ) : null}
      {(chainStore.current.features ?? []).find(
        (feature) => feature === "cosmwasm" || feature === "secretwasm"
      ) ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            history.push({
              pathname: "/setting/token/manage",
            });
          }}
        >
          <FormattedMessage id="main.menu.token-list" />
          <div>
            <img
              style={{ width: "6.5px", height: "13px" }}
              src={require("../../public/assets/img/right-caret.svg")}
            />
          </div>
        </div>
      ) : null}
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      <div className={styleMenu.footer}>
        <div
          className={styleMenu.lockButton}
          onClick={() => {
            keyRingStore.lock();
          }}
        >
          <FormattedMessage id="main.menu.sign-out" />
        </div>
      </div>
    </div>
  );
});
