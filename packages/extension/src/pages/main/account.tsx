import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNotification } from "../../components/notification";
import { ToolTip } from "../../components/tooltip";
import { useIntl } from "react-intl";
import { WalletStatus } from "@proof-wallet/stores";
import { KeplrError } from "@proof-wallet/router";
import { useHistory } from "react-router";
import { Bech32Address } from "@proof-wallet/cosmos";

export const createShortenName = (name: string) => {
  if (name === "") {
    return "";
  } else if (name.indexOf(" ") > 0 && name.indexOf(" ") < name.length - 1) {
    return name[0] + name[name.indexOf(" ") + 1];
  } else {
    return name[0];
  }
};

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();
  const history = useHistory();
  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: intl.formatMessage({
            id: "main.address.copied",
          }),
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }
    },
    [accountInfo.walletStatus, notification, intl]
  );

  return (
    <div style={{ position: "relative" }}>
      <div
        className={styleAccount.containerName}
        // onMouseEnter={() => isShow(true)}
      >
        <div className={styleAccount.name}>
          {accountInfo.walletStatus === WalletStatus.Loaded && (
            <div
              className={styleAccount.avatar}
              style={{ background: "#FFD48A" }}
            >
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
          <img
            className={styleAccount.dropdownImage}
            src={require("../../public/assets/img/arrow.svg")}
          />
        </div>
        <div className={styleAccount.selectPopupWrapper}>
          <div
            className={styleAccount.selectPopup}
            // onMouseLeave={() => isShow(false)}
          >
            {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.bech32Address && (
                <div
                  className={styleAccount.selectItem}
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      accountInfo.bech32Address
                    );
                  }}
                >
                  <div>
                    {Bech32Address.shortenAddress(
                      accountInfo.bech32Address,
                      13
                    )}
                  </div>
                  <img
                    style={{ width: "13px", height: "13px" }}
                    src={require("../../public/assets/img/copy-icon.svg")}
                  />
                </div>
              )}
            <div
              className={styleAccount.selectItem}
              onClick={() => history.push("/setting/set-keyring")}
            >
              <div>switch wallet</div>
              <img
                style={{ width: "13px", height: "13px" }}
                src={require("../../public/assets/img/change.svg")}
              />
            </div>
          </div>
        </div>
      </div>
      {accountInfo.walletStatus === WalletStatus.Rejected && (
        <ToolTip
          tooltip={(() => {
            if (
              accountInfo.rejectionReason &&
              accountInfo.rejectionReason instanceof KeplrError &&
              accountInfo.rejectionReason.module === "keyring" &&
              accountInfo.rejectionReason.code === 152
            ) {
              // Return unsupported device message
              return "Ledger is not supported for this chain";
            }

            let result = "Failed to load account by unknown reason";
            if (accountInfo.rejectionReason) {
              result += `: ${accountInfo.rejectionReason.toString()}`;
            }

            return result;
          })()}
          theme="dark"
          trigger="hover"
          options={{
            placement: "top",
          }}
        >
          <i
            className={`fas fa-exclamation-triangle text-danger ${styleAccount.unsupportedKeyIcon}`}
          />
        </ToolTip>
      )}
      {/* {accountInfo.walletStatus !== WalletStatus.Rejected && (
        <div className={styleAccount.containerAccount}>
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            // onClick={() => copyAddress(accountInfo.bech32Address)}
            onClick={() => history.push("/setting/set-keyring")}
          >
            <Address maxCharacters={22} lineBreakBeforePrefix={false}>
              {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.bech32Address
                ? accountInfo.bech32Address
                : "..."}
            </Address>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )} */}
      {accountInfo.hasEthereumHexAddress && (
        <div
          className={styleAccount.containerAccount}
          style={{ marginTop: "2px" }}
        >
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.ethereumHexAddress)}
          >
            <Address
              isRaw={true}
              tooltipAddress={accountInfo.ethereumHexAddress}
            >
              {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.ethereumHexAddress
                ? accountInfo.ethereumHexAddress.length === 42
                  ? `${accountInfo.ethereumHexAddress.slice(
                      0,
                      10
                    )}...${accountInfo.ethereumHexAddress.slice(-8)}`
                  : accountInfo.ethereumHexAddress
                : "..."}
            </Address>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
    </div>
  );
});
