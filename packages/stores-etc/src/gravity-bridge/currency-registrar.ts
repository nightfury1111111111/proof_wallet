import { observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@proof-wallet/types";
import {
  ChainInfoInner,
  ChainStore,
  IQueriesStore,
} from "@proof-wallet/stores";
import { DenomHelper, KVStore } from "@proof-wallet/common";
import { ProofETCQueries } from "../queries";

export class GravityBridgeCurrencyRegsitrarInner<
  C extends ChainInfo = ChainInfo
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainInfoInner: ChainInfoInner<C>,
    protected readonly chainStore: ChainStore<C>,
    protected readonly queriesStore: IQueriesStore<ProofETCQueries>
  ) {}

  registerUnknownCurrencies(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("gravity0x")
    ) {
      return;
    }

    const queries = this.queriesStore.get(this.chainInfoInner.chainId);

    const contractAddress = denomHelper.denom.replace("gravity", "");

    const erc20Metadata = queries.proofETC.queryERC20Metadata.get(
      contractAddress
    );
    if (erc20Metadata.symbol && erc20Metadata.decimals != null) {
      return [
        {
          coinMinimalDenom: denomHelper.denom,
          coinDenom: erc20Metadata.symbol,
          coinDecimals: erc20Metadata.decimals,
        },
        true,
      ];
    }

    return [undefined, false];
  }
}

export class GravityBridgeCurrencyRegsitrar<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected map: Map<
    string,
    GravityBridgeCurrencyRegsitrarInner<C>
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore<C>,
    protected readonly queriesStore: IQueriesStore<ProofETCQueries>
  ) {
    this.chainStore.addSetChainInfoHandler((chainInfoInner) =>
      this.setChainInfoHandler(chainInfoInner)
    );
  }

  setChainInfoHandler(chainInfoInner: ChainInfoInner<C>): void {
    const inner = this.get(chainInfoInner);
    chainInfoInner.registerCurrencyRegistrar((coinMinimalDenom) =>
      inner.registerUnknownCurrencies(coinMinimalDenom)
    );
  }

  protected get(
    chainInfoInner: ChainInfoInner<C>
  ): GravityBridgeCurrencyRegsitrarInner<C> {
    if (!this.map.has(chainInfoInner.chainId)) {
      runInAction(() => {
        this.map.set(
          chainInfoInner.chainId,
          new GravityBridgeCurrencyRegsitrarInner<C>(
            this.kvStore,
            chainInfoInner,
            this.chainStore,
            this.queriesStore
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(chainInfoInner.chainId)!;
  }
}
