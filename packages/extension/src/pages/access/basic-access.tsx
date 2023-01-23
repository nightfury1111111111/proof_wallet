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
        <div className={style.description}>
          <div className={style.permission}>
            <FormattedMessage id="access.permission.title" />
          </div>
          <ul>
            <div style={{ marginBottom: "19px" }}>
              <img
                src={require("../../public/assets/img/check.svg")}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              <FormattedMessage id="access.permission.account" />
            </div>
            <div>
              <img
                src={require("../../public/assets/img/check.svg")}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              <FormattedMessage id="access.permission.tx-request" />
            </div>
            {isSecretWasmIncluded ? (
              <div>
                <i
                  key="selected"
                  className="fas fa-check"
                  style={{ color: "#7EFF9B", marginRight: "10px" }}
                />
                <FormattedMessage id="access.permission.secret" />
              </div>
            ) : null}
          </ul>
        </div>
        {/* <div className={style.buttons}>
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
        </div> */}
        <div className={style.footer}>
          <Button
            className={style.button}
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
            type="submit"
            block
            className={style.buttonActive}
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
