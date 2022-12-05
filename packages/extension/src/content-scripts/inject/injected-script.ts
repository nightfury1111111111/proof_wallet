import { InjectedProof } from "@proof-wallet/provider";
import { injectProofToWindow } from "@proof-wallet/provider";

import manifest from "../../manifest.json";

const proof = new InjectedProof(manifest.version, "extension");
injectProofToWindow(proof);
