import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { StakeView } from "./stake";

import classnames from "classnames";
// import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { TokensView } from "./token";
import { BIP44SelectModal } from "./bip44-select-modal";
import { useIntl } from "react-intl";
import { useConfirm } from "../../components/confirm";
import { ChainUpdaterService } from "@proof-wallet/background";
import { IBCTransferView } from "./ibc-transfer";
import { DenomHelper } from "@proof-wallet/common";
import { Dec } from "@proof-wallet/unit";
import { WalletStatus } from "@proof-wallet/stores";
import { VestingInfo } from "./vesting-info";
import { LedgerAppModal } from "./ledger-app-modal";

export const MainPage: FunctionComponent = observer(() => {
  // const history = useHistory();
  const intl = useIntl();

  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();

  const confirm = useConfirm();

  const current = chainStore.current;
  const currentChainId = current.chainId;
  const prevChainId = useRef<string | undefined>();
  useEffect(() => {
    if (!chainStore.isInitializing && prevChainId.current !== currentChainId) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(
          chainStore.current
        );
        if (result.explicit) {
          // If chain info has been changed, warning the user wether update the chain or not.
          if (
            await confirm.confirm({
              paragraph: intl.formatMessage({
                id: "main.update-chain.confirm.paragraph",
              }),
              yes: intl.formatMessage({
                id: "main.update-chain.confirm.yes",
              }),
              no: intl.formatMessage({
                id: "main.update-chain.confirm.no",
              }),
            })
          ) {
            await chainStore.tryUpdateChain(chainStore.current.chainId);
          }
        } else if (result.slient) {
          await chainStore.tryUpdateChain(chainStore.current.chainId);
        }
      })();

      prevChainId.current = currentChainId;
    }
  }, [chainStore, confirm, chainStore.isInitializing, currentChainId, intl]);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queryAccount = queriesStore
    .get(chainStore.current.chainId)
    .cosmos.queryAccount.getQueryBech32Address(accountInfo.bech32Address);
  // Show the spendable balances if the account is vesting account.
  const showVestingInfo = (() => {
    // If the chain can't query /cosmos/bank/v1beta1/spendable_balances/{account},
    // no need to show the vesting info because its query always fails.
    if (
      !current.features ||
      !current.features.includes(
        "query:/cosmos/bank/v1beta1/spendable_balances"
      )
    ) {
      return false;
    }

    return !!(
      !queryAccount.error &&
      queryAccount.response &&
      queryAccount.isVestingAccount
    );
  })();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const tokens = queryBalances.unstakables.filter((bal) => {
    // Temporary implementation for trimming the 0 balanced native tokens.
    // TODO: Remove this part.
    if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
      return bal.balance.toDec().gt(new Dec("0"));
    }
    return true;
  });

  const hasTokens = tokens.length > 0;

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={<Menu />}
      rightRenderer={
        <div
          style={{
            height: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <div
            style={{
              background: 'radial-gradient(75% 75% at 50% 25%, #C4FFD1 3.88%, #7EFF9B 100%)', // if it is connected, green color if not, red
              width: "5px",
              height: "5px",
              borderRadius: "10px",
              cursor: "pointer",
              padding: "4px",
            }}
            // onClick={(e) => {
            //   e.preventDefault();

            //   history.push("/setting/set-keyring");
            // }}
          />
        </div>
      }
    >
      <BIP44SelectModal />
      <LedgerAppModal />
      <Card className={classnames(style.card, "shadow")}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
            {accountInfo.walletStatus !== WalletStatus.Rejected && (
              <TxButtonView />
            )}
          </div>
        </CardBody>
      </Card>
      {showVestingInfo ? <VestingInfo /> : null}
      {chainStore.current.walletUrlForStaking ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <StakeView />
          </CardBody>
        </Card>
      ) : null}
      {hasTokens ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>{<TokensView />}</CardBody>
        </Card>
      ) : null}
      {uiConfigStore.showAdvancedIBCTransfer &&
      chainStore.current.features?.includes("ibc-transfer") ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            <IBCTransferView />
          </CardBody>
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
