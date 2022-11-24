import {
  CosmosQueriesImpl,
  IQueriesStore,
  OsmosisQueries,
} from "@proof-wallet/stores";

export type QueriesStore = IQueriesStore<
  Partial<OsmosisQueries> & {
    cosmos?: Pick<CosmosQueriesImpl, "queryDelegations">;
  }
>;
