import { RNInjectedKeplr } from "./injected-provider";
import { injectKeplrToWindow } from "@proof-wallet/provider";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.10.10", "mobile-web");
injectKeplrToWindow(keplr);
