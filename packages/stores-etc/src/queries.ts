import { QueriesSetBase, ChainGetter } from "@proof-wallet/stores";
import { KVStore } from "@proof-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryERC20Metadata } from "./erc20";
import { ObservableQueryEVMTokenInfo } from "./axelar";

export interface ProofETCQueries {
  proofETC: ProofETCQueriesImpl;
}

export const ProofETCQueries = {
  use(options: {
    ethereumURL: string;
  }): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => ProofETCQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        proofETC: new ProofETCQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter,
          options.ethereumURL
        ),
      };
    };
  },
};

export class ProofETCQueriesImpl {
  public readonly queryERC20Metadata: DeepReadonly<ObservableQueryERC20Metadata>;
  public readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;

  constructor(
    _base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    ethereumURL: string
  ) {
    this.queryERC20Metadata = new ObservableQueryERC20Metadata(
      kvStore,
      ethereumURL
    );
    this.queryEVMTokenInfo = new ObservableQueryEVMTokenInfo(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
