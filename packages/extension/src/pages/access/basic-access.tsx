import React, { FunctionComponent, useMemo } from "react";

import { useInteractionInfo } from "@proof-wallet/hooks";
import { Button } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";

export const AccessPage: FunctionComponent = observer(() => {
  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingBasicAccessPermissions.length > 0
      ? permissionStore.waitingBasicAccessPermissions[0]
      : undefined;

  const ineractionInfo = useInteractionInfo(() => {
    permissionStore.rejectAll();
  });

  const isSecretWasmIncluded = useMemo(() => {
    if (waitingPermission) {
      for (const chainId of waitingPermission.data.chainIds) {
        if (chainStore.hasChain(chainId)) {
          const chainInfo = chainStore.getChain(chainId);
          if (chainInfo.features && chainInfo.features.includes("secretwasm")) {
            return true;
          }
        }
      }
    }
    return false;
  }, [chainStore, waitingPermission]);

  const host = useMemo(() => {
    if (waitingPermission) {
      return waitingPermission.data.origins
        .map((origin) => {
          return new URL(origin).host;
        })
        .join(", ");
    } else {
      return "";
    }
  }, [waitingPermission]);

  // const chainIds = useMemo(() => {
  //   if (!waitingPermission) {
  //     return "";
  //   }

  //   return waitingPermission.data.chainIds.join(", ");
  // }, [waitingPermission]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "36px" }}>
      <div className={style.container}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <img
            alt="unlink"
            src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=64`}
            style={{ width: "64px", height: "64px" }}
          />
        </div>
        <h1 className={style.header}>
          <FormattedMessage id="access.title" />
        </h1>
        <p className={style.paragraph}>
          {/* <FormattedMessage
            id="access.paragraph"
            values={{
              host,
              chainId: chainIds,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>,
            }}
          /> */}
          {host}
        </p>
        <div className={style.divideLine} />
        <div className={style.permission}>
          <FormattedMessage id="access.permission.title" />
        </div>
        <ul>
          <li style={{ marginBottom: "19px" }}>
            <FormattedMessage id="access.permission.account" />
          </li>
          <li style={{ marginBottom: "8px" }}>
            <FormattedMessage id="access.permission.tx-request" />
          </li>
          {isSecretWasmIncluded ? (
            <li>
              <FormattedMessage id="access.permission.secret" />
            </li>
          ) : null}
        </ul>
        <div className={style.divideLine} />
        <div
          style={{
            fontSize: "14px",
            color: "#6c6c6c",
            fontWeight: 400,
            textAlign: "center",
            marginTop: "14px",
          }}
        >
          Only connect to websites you trust
        </div>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
                if (
                  permissionStore.waitingBasicAccessPermissions.length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (
                  permissionStore.waitingBasicAccessPermissions.length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            disabled={!waitingPermission}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
