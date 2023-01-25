import { Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";

export class SetPersistentMemoryMsg extends Message<{ success: boolean }> {
  public static type() {
    return "proof-set-persistent-memory";
  }

  constructor(public readonly data: any) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetPersistentMemoryMsg.type();
  }
}

export class GetPersistentMemoryMsg extends Message<any> {
  public static type() {
    return "proof-get-persistent-memory";
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPersistentMemoryMsg.type();
  }
}
