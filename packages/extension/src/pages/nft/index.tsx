import React, { FunctionComponent, useEffect, useState } from "react";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const rpcEndpoint = "https://sei-chain-incentivized.com/sei-chain-tm/";

const sender = {
  mnemonic:
    "cheap gain pink ankle exotic exile blast escape clean much jelly renew",
  address: "sei138jdvsrjdgvwwajm6jhtwetffa5qxzj77nhynz",
};

import { useStore } from "../../stores";
import { NftList } from "../../config";

import { HeaderLayout } from "../../layouts";
import { Footer } from "../../components/footer";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { useHistory, useLocation } from "react-router";

export interface Nft {
  address: string;
  name: string;
  apiEndpoint: string;
  ext: string;
  id: Array<string>;
}

export const ManageNftPage: FunctionComponent = observer(() => {
  const [nfts, setNfts] = useState<Array<Nft>>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (nfts.length > 0)
      console.log(
        `url(${nfts[0].apiEndpoint}images/${nfts[0].id[0]}.${nfts[0].ext})`
      );
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
      <div className={style.nftContainer}>
        {isLoading && (
          <div className={style.loadingContainer}>
            <i
              className="fas fa-spinner fa-spin ml-1"
              style={{ color: "white" }}
            />
          </div>
        )}
        {nfts.map((nft, idx) => {
          return (
            <div
              key={idx}
              className={style.nftTile}
              style={{
                backgroundImage: `url(${nft.apiEndpoint}images/${nft.id[0]}.${nft.ext})`,
              }}
            >
              <div className={style.nftName}>
                {`${nft.name} ${nft.id.length}`}
              </div>
            </div>
          );
        })}
      </div>
      {!isLoading && <div style={{ height: "70px", color: "transparent" }} />}
      <Footer />
    </HeaderLayout>
  );
});
