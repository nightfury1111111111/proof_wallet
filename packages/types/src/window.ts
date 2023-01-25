import { Proof } from "./wallet";
import { OfflineAminoSigner, OfflineDirectSigner } from "./cosmjs";
import { SecretUtils } from "secretjs/types/enigmautils";

export interface Window {
  proof?: Proof;
  getOfflineSigner?: (
    chainId: string
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => OfflineAminoSigner;
  getOfflineSignerAuto?: (
    chainId: string
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}
