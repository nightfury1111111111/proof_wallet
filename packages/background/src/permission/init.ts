import { Router } from "@proof-wallet/router";
import { PermissionService } from "./service";
import {
  AddPermissionOrigin,
  EnableAccessProofMsg,
  GetOriginPermittedChainsMsg,
  GetPermissionOriginsMsg,
  RemovePermissionOrigin,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: PermissionService): void {
  router.registerMessage(EnableAccessProofMsg);
  router.registerMessage(GetPermissionOriginsMsg);
  router.registerMessage(GetOriginPermittedChainsMsg);
  router.registerMessage(AddPermissionOrigin);
  router.registerMessage(RemovePermissionOrigin);

  router.addHandler(ROUTE, getHandler(service));
}
