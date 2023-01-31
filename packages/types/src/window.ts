import { Proof } from "./wallet";
import { OfflineAminoSigner, OfflineDirectSigner } from "./cosmjs";
import { SecretUtils } from "secretjs/types/enigmautils";

export interface Window {
  proof?: Proof;
  getOfflineProofSigner?: (
    chainId: string
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineProofSignerOnlyAmino?: (chainId: string) => OfflineAminoSigner;
  getOfflineProofSignerAuto?: (
    chainId: string
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  getProofEnigmaUtils?: (chainId: string) => SecretUtils;
}
