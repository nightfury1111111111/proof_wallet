import {
  ChainStore,
  QueriesStore,
  AccountStore,
  CosmosAccount,
  CosmosQueries,
} from "@proof-wallet/stores";
import { IndexedDBKVStore } from "@proof-wallet/common";
import { ChainInfo } from "@proof-wallet/types";
import { getWCKeplr } from "../get-wc-keplr";
import { EmbedChainInfos } from "../config";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<[CosmosQueries]>;
  public readonly accountStore: AccountStore<[CosmosAccount]>;

  constructor() {
    this.chainStore = new ChainStore<ChainInfo>(EmbedChainInfos);

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore("store_queries"),
      this.chainStore,
      CosmosQueries.use()
    );

    this.accountStore = new AccountStore(
      window,
      this.chainStore,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
          getKeplr: getWCKeplr,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      })
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
