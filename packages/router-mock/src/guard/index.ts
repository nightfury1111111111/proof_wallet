import { Guard } from "@proof-wallet/router";
import { ExtensionGuards } from "@proof-wallet/router-extension";

export class MockGuards {
  static readonly checkOriginIsValid: Guard =
    ExtensionGuards.checkOriginIsValid;

  static readonly checkMessageIsInternal: Guard =
    ExtensionGuards.checkMessageIsInternal;
}
