import { Window as ProofWindow } from "@proof-wallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends ProofWindow {}
}
