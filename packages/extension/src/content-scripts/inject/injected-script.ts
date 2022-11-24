import { InjectedKeplr } from "@proof-wallet/provider";
import { injectKeplrToWindow } from "@proof-wallet/provider";

import manifest from "../../manifest.json";

const keplr = new InjectedKeplr(manifest.version, "extension");
injectKeplrToWindow(keplr);
