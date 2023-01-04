import React, { FunctionComponent, useEffect, useMemo } from "react";
import {
  AddressInput,
  // FeeButtons,
  // MemoInput,
} from "../../components/form";
import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";
import { FeeButtons } from "../../components/form";
import { Menu } from "../main/menu";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";
import { useNotification } from "../../components/notification";

import { useIntl } from "react-intl";
import { Button } from "reactstrap";

import { useHistory, useLocation } from "react-router";
import queryString from "querystring";

import { useGasSimulator, useSendTxConfig } from "@proof-wallet/hooks";
import { EthereumEndpoint } from "../../config.ui";
import {
  fitPopupWindow,
  openPopupWindow,
  PopupSize,
} from "@proof-wallet/popup";
import { DenomHelper, ExtensionKVStore } from "@proof-wallet/common";

export const SendNftPage: FunctionComponent = observer(() => {
  const history = useHistory();
  console.log(useLocation().search);
  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    contractAddress: string;
    nftId: string;
    imageUrl: string;
    name: string;
    defaultDenom: string | undefined;
    defaultRecipient: string | undefined;
    defaultAmount: string | undefined;
    defaultMemo: string | undefined;
    detached: string | undefined;
  };

  console.log(query);

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const intl = useIntl();

  const notification = useNotification();

  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    analyticsStore,
  } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);
  console.log(accountInfo.isSendingMsg);
  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    current.chainId,
    accountInfo.bech32Address,
    {
      ensEndpoint: EthereumEndpoint,
      allowHexAddressOnEthermint: true,
    }
  );

  const gasSimulatorKey = useMemo(() => {
    if (sendConfigs.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom
      );

      if (denomHelper.type !== "native") {
        if (denomHelper.type === "cw20") {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return denomHelper.type;
      }
    }

    return "native";
  }, [sendConfigs.amountConfig.sendCurrency]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    current.chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.sendCurrency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.error != null ||
        sendConfigs.recipientConfig.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      return accountInfo.makeSendTokenTx(
        sendConfigs.amountConfig.amount,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sendConfigs.amountConfig.sendCurrency!,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.sendCurrency &&
      new DenomHelper(sendConfigs.amountConfig.sendCurrency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulator.forceDisable(
        new Error("Simulating secret20 is not supported")
      );
      sendConfigs.gasConfig.setGas(
        accountInfo.secret.msgOpts.send.secret20.gas
      );
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [
    accountInfo.secret.msgOpts.send.secret20.gas,
    gasSimulator,
    sendConfigs.amountConfig.sendCurrency,
    sendConfigs.gasConfig,
  ]);

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = current.currencies.find(
        (cur) => cur.coinMinimalDenom === query.defaultDenom
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [current.currencies, query.defaultDenom, sendConfigs.amountConfig]);

  const isDetachedPage = query.detached === "true";

  useEffect(() => {
    if (isDetachedPage) {
      fitPopupWindow();
    }
  }, [isDetachedPage]);

  useEffect(() => {
    if (query.defaultRecipient) {
      sendConfigs.recipientConfig.setRawRecipient(query.defaultRecipient);
    }
    if (query.defaultAmount) {
      sendConfigs.amountConfig.setAmount(query.defaultAmount);
    }
    if (query.defaultMemo) {
      sendConfigs.memoConfig.setMemo(query.defaultMemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.defaultAmount, query.defaultMemo, query.defaultRecipient]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  return (
    <HeaderLayout
      canChangeChainInfo={false}
      showChainName
      menuRenderer={<Menu />}
      rightRenderer={
        isDetachedPage ? undefined : (
          <div
            style={{
              height: "36px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingRight: "20px",
            }}
          >
            <i
              className="fas fa-external-link-alt"
              style={{
                cursor: "pointer",
                padding: "4px",
                color: "#8B8B9A",
              }}
              onClick={async (e) => {
                e.preventDefault();

                const windowInfo = await browser.windows.getCurrent();

                let queryString = `?detached=true&defaultDenom=${sendConfigs.amountConfig.sendCurrency.coinMinimalDenom}`;
                if (sendConfigs.recipientConfig.rawRecipient) {
                  queryString += `&defaultRecipient=${sendConfigs.recipientConfig.rawRecipient}`;
                }
                if (sendConfigs.amountConfig.amount) {
                  queryString += `&defaultAmount=${sendConfigs.amountConfig.amount}`;
                }
                if (sendConfigs.memoConfig.memo) {
                  queryString += `&defaultMemo=${sendConfigs.memoConfig.memo}`;
                }

                await openPopupWindow(
                  browser.runtime.getURL(`/popup.html#/send${queryString}`),
                  undefined,
                  {
                    top: (windowInfo.top || 0) + 80,
                    left:
                      (windowInfo.left || 0) +
                      (windowInfo.width || 0) -
                      PopupSize.width -
                      20,
                  }
                );
                window.close();
              }}
            />
          </div>
        )
      }
    >
      <form
        className={style.formContainer}
        onSubmit={async (e) => {
          e.preventDefault();

          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              const stdFee = sendConfigs.feeConfig.toStdFee();

              console.log("send-nft");
              const tx = accountInfo.makeSendNftTx(
                query.contractAddress,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                Number(query.nftId),
                sendConfigs.recipientConfig.recipient
              );
              console.log("send-nft-tx", tx);

              await tx.send(
                stdFee,
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onBroadcasted: () => {
                    analyticsStore.logEvent("Send token tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: sendConfigs.feeConfig.feeType,
                    });
                  },
                }
              );

              console.log("success");

              if (!isDetachedPage) {
                history.replace("/");
              }
            } catch (e) {
              if (!isDetachedPage) {
                history.replace("/");
              }
              notification.push({
                type: "warning",
                placement: "top-center",
                duration: 5,
                content: `Fail to send token: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            } finally {
              // XXX: If the page is in detached state,
              // close the window without waiting for tx to commit. analytics won't work.
              if (isDetachedPage) {
                window.close();
              }
            }
          }
        }}
      >
        <div className={style.formInnerContainer}>
          <div>
            <div className={style.titleContainer}>
              <i
                className="fas fa-light fa-arrow-left"
                style={{
                  cursor: "pointer",
                  padding: "4px",
                  color: "#696969",
                  width: "20px",
                }}
                onClick={() => {
                  history.goBack();
                }}
              />
              <div
                className={style.title}
              >{`Send ${query.name} ${query.nftId}`}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <img className={style.nftImage} src={query.imageUrl} />
            </div>
            <AddressInput
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              // label={intl.formatMessage({ id: "send.input.recipient" })}
            />
            {/* <MemoInput
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: "send.input.memo" })}
            />*/}
            <FeeButtons
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              priceStore={priceStore}
              label={intl.formatMessage({ id: "send.input.fee" })}
              feeSelectLabels={{
                low: intl.formatMessage({ id: "fee-buttons.select.low" }),
                average: intl.formatMessage({
                  id: "fee-buttons.select.average",
                }),
                high: intl.formatMessage({ id: "fee-buttons.select.high" }),
              }}
              gasLabel={intl.formatMessage({ id: "send.input.gas" })}
              gasSimulator={gasSimulator}
            />
          </div>
          <div style={{ flex: 1 }} />
          {/* <Button
            type="submit"
            color="primary"
            block
            data-loading={accountInfo.isSendingMsg === "send"}
            disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
            style={{
              marginTop: "12px",
            }}
          >
            {intl.formatMessage({
              id: "send.button.send",
            })}
          </Button> */}
        </div>
        <div className={style.footer}>
          <Button className={style.button} onClick={() => history.replace("/")}>
            Cancel
          </Button>
          <Button
            type="submit"
            block
            disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
            className={style.buttonActive}
          >
            {intl.formatMessage({
              id: "send.button.send",
            })}
          </Button>
        </div>
      </form>
      <div style={{ height: "70px", color: "transparent" }} />
    </HeaderLayout>
  );
});
