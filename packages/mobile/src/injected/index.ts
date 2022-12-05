import { RNInjectedKeplr } from "./injected-provider";
import { injectProofToWindow } from "@proof-wallet/provider";

// TODO: Set the Keplr version properly
const proof = new RNInjectedKeplr("0.10.10", "mobile-web");
injectProofToWindow(proof);
