import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout } from "../../layouts";
import { Footer } from "../../components/footer";

// import { Card, CardBody } from "reactstrap";

import style from "./style.module.scss";
import styleToken from "./token.module.scss";
import { Menu } from "./menu";
// import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
// import { StakeView } from "./stake";

// import classnames from "classnames";
// import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { TokensView } from "./token";
import { BIP44SelectModal } from "./bip44-select-modal";
import { useIntl } from "react-intl";
import { useConfirm } from "../../components/confirm";
import { ChainUpdaterService } from "@proof-wallet/background";
import { IBCTransferView } from "./ibc-transfer";
// import { DenomHelper } from "@proof-wallet/common";
// import { Dec } from "@proof-wallet/unit";
import { WalletStatus } from "@proof-wallet/stores";
import { VestingInfo } from "./vesting-info";
import { LedgerAppModal } from "./ledger-app-modal";
import { DenomHelper } from "@proof-wallet/common";
import { Dec } from "@proof-wallet/unit";
// import Lottie from "react-lottie";

//TEMP VALUES
const tokenPrice = "$0.00";
const tokenPriceChange = "~$0.00";

const TmpTokenView = () => {
  const imageUrl = "https://proofwalletsvgs.s3.amazonaws.com/sei";
  const name = "SEI";
  return (
    <div className={styleToken.tokenContainer} style={{ marginTop: "23px" }}>
      {
        <div className={styleToken.icon}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "100000px",
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              color: "#FFFFFF",
              fontSize: "16px",
            }}
          />
        </div>
      }
      <div className={styleToken.innerContainer}>
        <div className={styleToken.content}>
          <div className={styleToken.name}>{name}</div>
          <div className={styleToken.amount}>0 SEI</div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div className={styleToken.tokenPriceWrap}>
        <div className={styleToken.tokenPrice}>{tokenPrice}</div>
        <div
          className={
            styleToken.tokenPrice && tokenPriceChange[0] === "+"
              ? styleToken.tokenPriceChangePositive
              : tokenPriceChange[0] === "~"
              ? styleToken.tokenPriceChangeNone
              : styleToken.tokenPriceChangeNegative
          }
        >
          {tokenPriceChange}
        </div>
      </div>
    </div>
  );
};

export const MainPage: FunctionComponent = observer(() => {
  // const history = useHistory();
  const intl = useIntl();

  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();
  // const [isLoading, setIsLoading] = useState(false);

  // const storeResult = useStore();
  // console.log(storeResult);

  const confirm = useConfirm();

  const current = chainStore.current;
  const currentChainId = current.chainId;
  const prevChainId = useRef<string | undefined>();

  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: require("../../public/assets/loading-state.json"),
  //   rendererSettings: {
  //     preserveAspectRatio: "xMidYMid slice",
  //   },
  // };

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

  // const queryBalances = queriesStore
  //   .get(chainStore.current.chainId)
  //   .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const tokens = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.concat(
      queriesStore
        .get(chainStore.current.chainId)
        .queryBalances.getQueryBech32Address(accountInfo.bech32Address).stakable
    )
    .filter((bal) => {
      // Temporary implementation for trimming the 0 balanced native tokens.
      // TODO: Remove this part.
      if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
        return bal.balance.toDec().gt(new Dec("0"));
      }
      return true;
    })
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero();
      const bDecIsZero = b.balance.toDec().isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });

  // const hasTokens = tokens.length > 0;

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={<Menu />}
      style={{
        zIndex: 999,
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
              width: "8px",
              height: "8px",
              borderRadius: "10px",
              cursor: "pointer",
              padding: "4px",
              visibility: "hidden",
            }}
            // onClick={(e) => {
            //   e.preventDefault();

            //   history.push("/setting/set-keyring");
            // }}
          />
        </div>
      }
    >
      {/* {isLoading && (
        <div className={style.loadingContainer}>
          <Lottie options={defaultOptions} height={42} width={42} />
        </div>
      )} */}
      {/* {!isLoading && ( */}
      <div>
        <BIP44SelectModal />
        <LedgerAppModal />
        {/* <Card className={classnames(style.card, "shadow")}> */}
        {/* <CardBody> */}
        <div className={style.containerAccountInner}>
          {/* <AccountView /> */}
          <AssetView />
          {accountInfo.walletStatus !== WalletStatus.Rejected && (
            <TxButtonView />
          )}
        </div>
        {/* </CardBody> */}
        {/* </Card> */}
        {showVestingInfo ? <VestingInfo /> : null}
        {/* {chainStore.current.walletUrlForStaking ? <StakeView /> : null} */}
        {tokens.length > 0 ? <TokensView /> : <TmpTokenView />}
        {/* {hasTokens ? (
        // <Card className={classnames(style.card, "shadow")}>
        // <CardBody>
        <TokensView />
      ) : // </CardBody>
      // </Card>
      null} */}
        {uiConfigStore.showAdvancedIBCTransfer &&
        chainStore.current.features?.includes("ibc-transfer") ? (
          // <Card className={classnames(style.card, "shadow")}>
          // <CardBody>
          <IBCTransferView />
        ) : // </CardBody>
        // </Card>
        null}
        <div style={{ height: "70px", color: "transparent" }} />
      </div>
      {/* )} */}
      <Footer />
    </HeaderLayout>
  );
});
