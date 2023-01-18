import React, { FunctionComponent, useEffect, useState, useMemo } from "react";
import axios from "axios";
import date from "date-and-time";

import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";
import { Footer } from "../../components/footer";
import { Hash } from "@proof-wallet/crypto";
import { Bech32Address } from "@proof-wallet/cosmos";
import { StoreUtils } from "@proof-wallet/stores";
import { CoinPretty } from "@proof-wallet/unit";
import { Currency } from "@proof-wallet/types";
import { NftList } from "../../config";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { useHistory } from "react-router";

export interface History {
  type?: string;
  tokenId?: string;
  height: number;
  timestamp: Date;
  address: string;
  txHash: string;
  balance: CoinPretty;
  activity: string;
}

const camelize = (str: string) => {
  const newStr: string = str[0].toUpperCase() + str.substr(-str.length + 1);
  return newStr;
};

export const HistoryView: FunctionComponent<{
  history: History;
  onClick: () => void;
}> = observer(({ onClick, history }) => {
  const [backgroundColors] = useState([
    "#5e72e4",
    "#11cdef",
    "#2dce89",
    "#fb6340",
  ]);

  const currentNft = NftList.filter((nft) => {
    return nft.address === history.address;
  })[0];
  const balance = history.balance.trim(true).shrink(true);
  const name =
    history.type === "NFT"
      ? currentNft.name
      : Object.keys(balance).length > 0
      ? balance.currency.coinDenom.toUpperCase()
      : "NFT";
  const imageUrl =
    history.type === "NFT"
      ? `${currentNft.apiEndpoint}images/${history.tokenId}.${currentNft.ext}`
      : Object.keys(balance.currency).indexOf("coinImageUrl") > -1
      ? balance.currency.coinImageUrl
      : "";
  const minimalDenom =
    Object.keys(balance).length > 0 ? balance.currency.coinMinimalDenom : "NFT";

  const backgroundColor = useMemo(() => {
    if (Object.keys(balance).length === 0) return "#D9D9D9";
    const hash = Hash.sha256(Buffer.from(minimalDenom));
    if (hash.length > 0) {
      return backgroundColors[hash[0] % backgroundColors.length];
    } else {
      return backgroundColors[0];
    }
  }, [backgroundColors, minimalDenom]);

  return (
    <div
      className={style.historyBox}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {imageUrl === "" ? (
        <div className={style.icon} style={{ backgroundColor }}>
          <img
            className={style.subIcon}
            src={
              history.activity === "Sent"
                ? require("../../public/assets/img/send.svg")
                : require("../../public/assets/img/receive.svg")
            }
          />
          {name.length > 0 ? name[0] : "?"}
        </div>
      ) : (
        <div
          className={style.icon}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
          }}
        >
          <img
            className={style.subIcon}
            src={
              history.activity === "Sent"
                ? require("../../public/assets/img/send.svg")
                : require("../../public/assets/img/receive.svg")
            }
          />
        </div>
      )}
      <div
        style={{
          width: "250px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className={style.activity}>{history.activity}</div>
          <div
            className={style.amount}
            style={{
              color: history.activity === "Sent" ? "#FFFFFF" : "#7EFF9B",
            }}
          >
            {history.type === "NFT"
              ? `${currentNft.name} #${history.tokenId}`
              : history.activity === "Sent"
              ? `- ${balance.maxDecimals(6).toString()}`
              : `+ ${balance.maxDecimals(6).toString()}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              style={{ width: "8.5px", height: "8.5px" }}
              src={
                history.activity === "Sent"
                  ? require("../../public/assets/img/sent.svg")
                  : require("../../public/assets/img/received.svg")
              }
            />
            <div className={style.address}>
              {Bech32Address.shortenAddress(history.address, 13)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const HistoryPage: FunctionComponent = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [tmpHistories, setTmpHistories] = useState<Array<History>>([]);

  const history = useHistory();

  const { chainStore, accountStore } = useStore();
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

  const accountInfo = accountStore.getAccount(current.chainId);

  const getHistory = async () => {
    let histories: Array<History> = [];
    setIsLoading(true);
    const send = async () => {
      const result = await axios.get(
        `https://node-6.sei-chain-incentivized.com/sei-chain-app/cosmos/tx/v1beta1/txs?pagination.limit=15&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.sender%3D%27${accountInfo.bech32Address}%27`
      );
      if (result.data.tx_responses.length > 0) {
        result.data.tx_responses.map((tx: any) => {
          if (
            tx.tx.body.messages[0]["@type"] ===
              "/cosmwasm.wasm.v1.MsgExecuteContract" &&
            Object.keys(tx.tx.body.messages[0].msg)[0] === "transfer_nft"
          ) {
            const hist: History = {
              type: "NFT",
              tokenId: tx.tx.body.messages[0].msg.transfer_nft.token_id,
              height: tx.height,
              timestamp: tx.timestamp,
              address: tx.tx.body.messages[0].contract,
              txHash: tx.txhash,
              // fake balance
              balance: StoreUtils.getBalancesFromCurrencies(currenciesMap, [
                { denom: "usei", amount: "1000000" },
              ])[0],
              activity: "Sent",
            };
            histories = histories.concat(hist);
            return true;
          }
          const tmpBalance =
            tx.tx.body.messages[0]["@type"] ===
              "/cosmwasm.wasm.v1.MsgExecuteContract" &&
            tx.tx.body.messages[0].funds.length === 0
              ? []
              : StoreUtils.getBalancesFromCurrencies(
                  currenciesMap,
                  tx.tx.body.messages[0]["@type"] ===
                    "/cosmos.bank.v1beta1.MsgSend"
                    ? [
                        {
                          denom: tx.tx.body.messages[0].amount[0].denom,
                          amount: tx.tx.body.messages[0].amount[0].amount,
                        },
                      ]
                    : tx.tx.body.messages[0]["@type"] ===
                      "/cosmwasm.wasm.v1.MsgExecuteContract"
                    ? [
                        {
                          denom: tx.tx.body.messages[0].funds[0].denom,
                          amount: tx.tx.body.messages[0].funds[0].amount,
                        },
                      ]
                    : [
                        {
                          denom: tx.tx.body.messages[0].amount[0].denom,
                          amount: tx.tx.body.messages[0].amount[0].amount,
                        },
                      ]
                );
          if (tmpBalance.length === 0) return;
          let balance = tmpBalance[0];
          const address =
            tx.tx.body.messages[0]["@type"] === "/cosmos.bank.v1beta1.MsgSend"
              ? tx.tx.body.messages[0].to_address
              : tx.tx.body.messages[0]["@type"] ===
                "/cosmwasm.wasm.v1.MsgExecuteContract"
              ? tx.tx.body.messages[0].contract
              : tx.tx.body.messages[0].to_address;
          if (
            "originCurrency" in balance.currency &&
            balance.currency.originCurrency
          ) {
            balance = balance.setCurrency(balance.currency.originCurrency);
          }
          const activity =
            tx.tx.body.messages[0]["@type"] === "/cosmos.bank.v1beta1.MsgSend"
              ? "Sent"
              : tx.tx.body.messages[0]["@type"] ===
                "/cosmwasm.wasm.v1.MsgExecuteContract"
              ? camelize(Object.keys(tx.tx.body.messages[0].msg)[0])
              : "Sent";

          const hist: History = {
            height: tx.height,
            timestamp: tx.timestamp,
            address,
            txHash: tx.txhash,
            balance,
            activity,
          };
          histories = histories.concat(hist);
          return true;
        });
      }
    };
    const receive = async () => {
      const result = await axios.get(
        `https://node-6.sei-chain-incentivized.com/sei-chain-app/cosmos/tx/v1beta1/txs?pagination.limit=15&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.recipient%3D%27${accountInfo.bech32Address}%27`
      );
      if (result.data.tx_responses.length > 0) {
        result.data.tx_responses.map((tx: any) => {
          const tmpBalance =
            tx.tx.body.messages[0]["@type"] ===
              "/cosmwasm.wasm.v1.MsgExecuteContract" &&
            tx.tx.body.messages[0].funds.length === 0
              ? []
              : StoreUtils.getBalancesFromCurrencies(
                  currenciesMap,
                  tx.tx.body.messages[0]["@type"] ===
                    "/cosmos.bank.v1beta1.MsgSend"
                    ? [
                        {
                          denom: tx.tx.body.messages[0].amount[0].denom,
                          amount: tx.tx.body.messages[0].amount[0].amount,
                        },
                      ]
                    : tx.tx.body.messages[0]["@type"] ===
                      "/cosmwasm.wasm.v1.MsgExecuteContract"
                    ? [
                        {
                          denom: tx.tx.body.messages[0].funds[0].denom,
                          amount: tx.tx.body.messages[0].funds[0].amount,
                        },
                      ]
                    : [
                        {
                          denom: tx.tx.body.messages[0].amount[0].denom,
                          amount: tx.tx.body.messages[0].amount[0].amount,
                        },
                      ]
                );
          if (tmpBalance.length === 0) return;
          let balance = tmpBalance[0];
          const address =
            tx.tx.body.messages[0]["@type"] === "/cosmos.bank.v1beta1.MsgSend"
              ? tx.tx.body.messages[0].from_address
              : tx.tx.body.messages[0]["@type"] ===
                "/cosmwasm.wasm.v1.MsgExecuteContract"
              ? tx.tx.body.messages[0].contract
              : tx.tx.body.messages[0].from_address;
          if (
            "originCurrency" in balance.currency &&
            balance.currency.originCurrency
          ) {
            balance = balance.setCurrency(balance.currency.originCurrency);
          }
          const activity =
            tx.tx.body.messages[0]["@type"] === "/cosmos.bank.v1beta1.MsgSend"
              ? "Received"
              : tx.tx.body.messages[0]["@type"] ===
                "/cosmwasm.wasm.v1.MsgExecuteContract"
              ? camelize(Object.keys(tx.tx.body.messages[0].msg)[0])
              : "Received";
          const hist: History = {
            height: tx.height,
            timestamp: tx.timestamp,
            address,
            txHash: tx.txhash,
            balance,
            activity,
          };
          histories = histories.concat(hist);
          return true;
        });
      }
    };
    const receiveNft = async () => {
      try {
        const query = `query {
        transferNftEntities (last: 10) {
            nodes {
              id
              blockHeight
              txHash
              sender
              recipient
              nftAddress
              tokenId
            }
        }
    }`;
        const {
          data: { data: queryData },
        } = await axios.post(
          "https://api.subquery.network/sq/nightfury1111111111/proof",
          { query }
        );
        queryData.transferNftEntities.nodes.map((nftHist: any) => {
          if (nftHist.recipient != accountInfo.bech32Address) return true;
          const hist: History = {
            type: "NFT",
            tokenId: nftHist.tokenId,
            height: nftHist.blockHeight,
            timestamp: nftHist.id,
            address: nftHist.nftAddress,
            txHash: nftHist.txHash,
            // fake balance
            balance: StoreUtils.getBalancesFromCurrencies(currenciesMap, [
              { denom: "usei", amount: "1000000" },
            ])[0],
            activity: "Received",
          };
          histories = histories.concat(hist);
          return true;
        });
      } catch (err) {
        console.log(err);
        return true;
      }
    };

    await Promise.all([send(), receive(), receiveNft()]);
    histories.sort((a, b) => {
      return b.height - a.height;
    });
    console.log("histories", histories);
    setTmpHistories(histories);
    setIsLoading(false);
  };

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
    getHistory();
  }, []);

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
      <div>
        {isLoading && (
          <div className={style.loadingContainer}>
            <i
              className="fas fa-spinner fa-spin ml-1"
              style={{ color: "white" }}
            />
          </div>
        )}
        {tmpHistories.length > 0 && (
          <div>
            {tmpHistories.map((hist, idx) => {
              return (
                <div key={idx}>
                  {idx === 0 ? (
                    <div className={style.date}>
                      {date.format(new Date(hist.timestamp), "MMM DD, YYYY")}
                    </div>
                  ) : Math.floor(
                      Number(new Date(hist.timestamp)) / 86400000
                    ) ===
                    Math.floor(
                      Number(new Date(tmpHistories[idx - 1].timestamp)) /
                        86400000
                    ) ? null : (
                    <div className={style.date}>
                      {date.format(new Date(hist.timestamp), "MMM DD, YYYY")}
                    </div>
                  )}
                  <HistoryView
                    history={hist}
                    onClick={() => {
                      console.log(idx);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        {!isLoading && <div style={{ height: "70px", color: "transparent" }} />}
      </div>
      <Footer />
    </HeaderLayout>
  );
});
