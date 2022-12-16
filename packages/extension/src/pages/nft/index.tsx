import React, { FunctionComponent, useEffect, useState } from "react";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { Input } from "reactstrap";
import classnames from "classnames";

import { useStore } from "../../stores";
import { NftList } from "../../config";

import { HeaderLayout } from "../../layouts";
import { Footer } from "../../components/footer";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { useHistory, useLocation } from "react-router";

const rpcEndpoint = "https://sei-chain-incentivized.com/sei-chain-tm/";
const sender = {
  mnemonic:
    "cheap gain pink ankle exotic exile blast escape clean much jelly renew",
  address: "sei138jdvsrjdgvwwajm6jhtwetffa5qxzj77nhynz",
};

export interface Nft {
  address: string;
  name: string;
  apiEndpoint: string;
  ext: string;
  id: Array<string>;
}

export const ManageNftPage: FunctionComponent = observer(() => {
  const [nfts, setNfts] = useState<Array<Nft>>([]);
  const [tmpNfts, setTmpNfts] = useState<Array<Nft>>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<string>("collection");
  const [currentCollectionIdx, setCurrentCollectionIdx] = useState(0);

  const history = useHistory();
  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const getTokens = async () => {
    // const gasPrice = GasPrice.fromString("0.05usei");
    const sender_wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      sender.mnemonic,
      { prefix: "sei" }
    );
    const sender_client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      sender_wallet
    );

    const tmpNftArray: Array<Nft> = [];
    setIsLoading(true);
    await Promise.all(
      NftList.map(async (nft) => {
        let num = 30;
        let startId = 0;
        let tmpIdArray: Array<string> = [];
        while (num === 30) {
          const msg = {
            tokens: {
              owner: accountInfo.bech32Address,
              limit: 30,
              start_after: startId.toString(),
            },
          };
          const createResult = await sender_client.queryContractSmart(
            nft.address,
            msg
          );
          num = createResult.tokens.length;
          if (num > 0) {
            startId = createResult.tokens[num - 1];
            tmpIdArray = tmpIdArray.concat(createResult.tokens);
          }
        }

        if (tmpIdArray.length > 0) tmpNftArray.push({ ...nft, id: tmpIdArray });
      })
    );
    setNfts(tmpNftArray);
    setIsLoading(false);
  };

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
    getTokens();
  }, []);

  useEffect(() => {
    if (nfts.length > 0) setTmpNfts(nfts);
  }, [nfts]);

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
      {page === "collection" && (
        <div>
          {isLoading && (
            <div className={style.loadingContainer}>
              <i
                className="fas fa-spinner fa-spin ml-1"
                style={{ color: "white" }}
              />
            </div>
          )}
          {!isLoading && (
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
                  spellCheck={false}
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
              <div className={style.funcBtn}>
                <img
                  style={{ width: "43px", height: "43px" }}
                  src={require("../../public/assets/img/button.svg")}
                />
              </div>
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
                    <span>{nft.name}</span>
                    <span style={{ marginLeft: "7px", opacity: "0.8" }}>
                      {nft.id.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {!isLoading && (
            <div style={{ height: "70px", color: "transparent" }} />
          )}
        </div>
      )}
      {page === "nfts" && (
        <div>
          {isLoading && (
            <div className={style.loadingContainer}>
              <i
                className="fas fa-spinner fa-spin ml-1"
                style={{ color: "white" }}
              />
            </div>
          )}
          <div className={style.collectionName}>
            {tmpNfts[currentCollectionIdx].name}
          </div>
          <div className={style.nftContainer}>
            {tmpNfts[currentCollectionIdx].id.map((nft, idx) => {
              return (
                <div
                  key={idx}
                  className={style.nftTile}
                  style={{
                    backgroundImage: `url(${tmpNfts[currentCollectionIdx].apiEndpoint}images/${nft}.${tmpNfts[currentCollectionIdx].ext})`,
                  }}
                  onClick={() => {
                    setPage("nfts");
                  }}
                >
                  <div className={style.nftName}>{`# ${nft}`}</div>
                </div>
              );
            })}
          </div>
          {!isLoading && (
            <div style={{ height: "70px", color: "transparent" }} />
          )}
        </div>
      )}
      <Footer />
    </HeaderLayout>
  );
});
