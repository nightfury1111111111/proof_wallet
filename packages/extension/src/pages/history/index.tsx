import React, { FunctionComponent, useEffect, useState } from "react";
import axios from "axios";

import { useStore } from "../../stores";

import { HeaderLayout } from "../../layouts";
import { Footer } from "../../components/footer";
import { Bech32Address } from "@proof-wallet/cosmos";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { useHistory } from "react-router";

export interface History {
  height: number;
  timestamp: Date;
  address: string;
  txHash: string;
  denom: string;
  amount: string;
  activity: string;
}

// ("https://rest-sei-test.ecostake.com/cosmos/tx/v1beta1/txs?pagination.limit=100&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.sender%3D%27sei18hmgrq5adawcf3fkcznngs5gdwwyadahkl49d2%27&cacheToken=0.871511244630278");
// ("https://rest-sei-test.ecostake.com/cosmos/tx/v1beta1/txs?pagination.limit=100&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.recipient%3D%27sei18hmgrq5adawcf3fkcznngs5gdwwyadahkl49d2%27&cacheToken=0.6878718713211234");

export const HistoryPage: FunctionComponent = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [tmpHistories, setTmpHistories] = useState<Array<History>>([]);
  const history = useHistory();

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const getHistory = async () => {
    let histories: Array<History> = [];
    setIsLoading(true);
    const send = async () => {
      const result = await axios.get(
        `https://rest-sei-test.ecostake.com/cosmos/tx/v1beta1/txs?pagination.limit=100&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.sender%3D%27${accountInfo.bech32Address}%27`
      );
      if (result.data.tx_responses.length > 0) {
        const sendRes: Array<History> = result.data.tx_responses.map(
          (tx: any) => {
            const hist: History = {
              height: tx.height,
              timestamp: tx.timestamp,
              address: tx.tx.body.messages[0].to_address,
              txHash: tx.txhash,
              denom: tx.tx.body.messages[0].amount[0].denom,
              amount: tx.tx.body.messages[0].amount[0].amount,
              activity: "Sent",
            };
            return hist;
          }
        );
        histories = histories.concat(sendRes);
      }
    };
    const receive = async () => {
      const result = await axios.get(
        `https://rest-sei-test.ecostake.com/cosmos/tx/v1beta1/txs?pagination.limit=100&pagination.offset=0&orderBy=ORDER_BY_DESC&events=transfer.recipient%3D%27${accountInfo.bech32Address}%27`
      );
      if (result.data.tx_responses.length > 0) {
        const receiveRes: Array<History> = result.data.tx_responses.map(
          (tx: any) => {
            const hist: History = {
              height: tx.height,
              timestamp: tx.timestamp,
              address: tx.tx.body.messages[0].from_address,
              txHash: tx.txhash,
              denom: tx.tx.body.messages[0].amount[0].denom,
              amount: tx.tx.body.messages[0].amount[0].amount,
              activity: "Received",
            };
            return hist;
          }
        );
        histories = histories.concat(receiveRes);
      }
    };
    await Promise.all([send(), receive()]);
    histories.sort((a, b) => {
      return b.height - a.height;
    });
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
                <div key={idx} className={style.historyBox}>
                  <div className={style.icon} />
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
                      <div className={style.activity}>{hist.activity}</div>
                      <div
                        className={style.amount}
                        style={{
                          color:
                            hist.activity === "Received"
                              ? "#7EFF9B"
                              : "#E9E4DFs",
                        }}
                      >{`${hist.amount} ${hist.denom}`}</div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className={style.address}>
                        {Bech32Address.shortenAddress(hist.address, 13)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* {!isLoading && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: "280px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                marginTop: "14px",
              }}
            >
              <Input
                className={classnames(
                  "form-control-alternative",
                  style.searchBox
                )}
                placeholder="Search a collectible"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  const availableNfts = nfts.filter((nft) => {
                    return (
                      nft.name
                        .toLowerCase()
                        .indexOf(e.target.value.toLowerCase()) > -1
                    );
                  });
                  setTmpNfts(availableNfts);
                  e.preventDefault();
                }}
                autoComplete="off"
              />
              <img
                className={style.searchIcon}
                src={require("../../public/assets/img/search.svg")}
              />
            </div>
            <img
              className={style.funcBtn}
              src={require("../../public/assets/img/button.svg")}
            />
          </div>
        )}
        <div className={style.nftContainer}>
          {tmpNfts.map((nft, idx) => {
            return (
              <div
                key={idx}
                className={style.nftTile}
                style={{
                  backgroundImage: `url(${nft.apiEndpoint}images/${nft.id[0]}.${nft.ext})`,
                }}
                onClick={() => {
                  setCurrentCollectionIdx(idx);
                  setPage("nfts");
                }}
              >
                <div className={style.nftName}>
                  {`${nft.name} ${nft.id.length}`}
                </div>
              </div>
            );
          })}
        </div>
        {!isLoading && <div style={{ height: "70px", color: "transparent" }} />} */}
      </div>
      <Footer />
    </HeaderLayout>
  );
});
