import React, { FunctionComponent, useEffect, useState } from "react";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { Input, Button } from "reactstrap";
import classnames from "classnames";

import { useStore } from "../../stores";
import { NftList } from "../../config";
import { useIntl } from "react-intl";
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
  const [selectedNFT, setSelectedNFT] = useState("");
  const [currentCollectionIdx, setCurrentCollectionIdx] = useState(0);
  const [focused, setFocused] = useState(false);

  const history = useHistory();
  let search = useLocation().search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const fakeAttributes = [
    { trait_type: "face", value: "in love" },
    { trait_type: "hair", value: "blue brushcut" },
    { trait_type: "body", value: "pink puffer" },
    { trait_type: "background", value: "gradient 1" },
    { trait_type: "head", value: "pink" },
  ];
  const intl = useIntl();
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
        if (page === "singleNFT") {
          history.push("/collection");
        }
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
              <div
                className={style.inputWrapper}
                style={
                  focused
                    ? {
                        border: "4px solid rgba(255, 212, 138, 0.3)",
                        // transform: "translate(-4px, -4px)",
                      }
                    : {}
                }
              >
                <Input
                  className={classnames(
                    "form-control-alternative",
                    style.searchBox
                  )}
                  placeholder="Search a collectible"
                  value={keyword}
                  spellCheck={false}
                  onFocus={() => {
                    setFocused(true);
                  }}
                  onBlur={() => {
                    setFocused(false);
                  }}
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
              </div>
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
          {isLoading && (
            <div className={style.noNftContainer}>
              <img
                src={require("../../public/assets/img/noNFTgroup.svg")}
                className={style.noNfts}
                alt="No NFTs"
              />
            </div>
          )}
          {tmpNfts.length > 0 ? (
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
                      if (nft.id.length == 1) {
                        setSelectedNFT(nft.id[0]);
                        setCurrentCollectionIdx(idx);
                        setPage("singleNFT");
                      } else {
                        setCurrentCollectionIdx(idx);
                        setPage("nfts");
                      }
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
          ) : (
            !isLoading && (
              <div>
                <div className={style.noNftsBubble}>
                  <span className={style.noNftsBubbleText}>
                    You don’t own any NFTs
                  </span>
                </div>
                <div className={style.noNftContainer}>
                  <img
                    src={require("../../public/assets/img/noNFTgroup.svg")}
                    className={style.noNfts}
                    alt="No NFTs"
                  />
                </div>
              </div>
            )
          )}
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
                    setSelectedNFT(nft);
                    setPage("singleNFT");
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
      {page === "singleNFT" && (
        <div>
          {isLoading && (
            <div className={style.loadingContainer}>
              <i
                className="fas fa-spinner fa-spin ml-1"
                style={{ color: "white" }}
              />
            </div>
          )}
          <div className={style.nftSelectedContainer}>
            <div className={style.nftTitle}>
              <span className={style.nftTitleText}>
                {tmpNfts[currentCollectionIdx].name} #{selectedNFT}
              </span>
            </div>
            <img
              src={`${tmpNfts[currentCollectionIdx].apiEndpoint}images/${selectedNFT}.${tmpNfts[currentCollectionIdx].ext}`}
              className={style.nftImage}
              alt="No NFTs"
            />
            <Button
              type="submit"
              block
              className={style.buttonActive}
              onClick={() => {
                history.push({
                  pathname: "/send-nft",
                  search: `?contractAddress=${
                    tmpNfts[currentCollectionIdx].address
                  }&imageUrl=${`${tmpNfts[currentCollectionIdx].apiEndpoint}images/${selectedNFT}.${tmpNfts[currentCollectionIdx].ext}`}&name=${
                    tmpNfts[currentCollectionIdx].name
                  }&nftId=${selectedNFT}`,
                });
              }}
            >
              {intl.formatMessage({
                id: "send.button.send",
              })}
            </Button>
            <span className={style.nftDescription}>
              A community-driven collectibles project featuring art by Burnt
              Toast. Doodles come in a joyful
            </span>
            <div className={style.attributesContainer}>
              {fakeAttributes.map((attribute, index) => {
                return (
                  <div className={style.attributeBox} key={index}>
                    <span className={style.attributeHead}>
                      {attribute.trait_type.toUpperCase()}
                    </span>
                    <span className={style.attributeText}>
                      {attribute.value}
                    </span>
                  </div>
                );
              })}
            </div>
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
