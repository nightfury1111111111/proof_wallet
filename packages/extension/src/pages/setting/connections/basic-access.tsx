import React, { FunctionComponent, useState } from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
// import { PageButton } from "../page-button";
// import {
//   ButtonDropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
// } from "reactstrap";

import styleConnections from "./style.module.scss";
import { useIntl } from "react-intl";
import { useConfirm } from "../../../components/confirm";
import { Button } from "reactstrap";

export const SettingConnectionsPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore, permissionStore } = useStore();
  const [selectedChainId] = useState(chainStore.current.chainId);
  const basicAccessInfo = permissionStore.getBasicAccessInfo(selectedChainId);

  const [loading, setLoading] = useState(false);

  // const [dropdownOpen, setOpen] = useState(false);
  // const toggle = () => setOpen(!dropdownOpen);

  const confirm = useConfirm();

  // const xIcon = useMemo(
  //   () => [<i key="remove" className="fas fa-times" />],
  //   []
  // );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.connections",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div style={{ marginTop: "15px" }}>
        {/* <ButtonDropdown
          isOpen={dropdownOpen}
          toggle={toggle}
          className={styleConnections.dropdown}
        >
          <DropdownToggle caret style={{ boxShadow: "none" }}>
            {chainStore.getChain(selectedChainId).chainName}
          </DropdownToggle>
          <DropdownMenu>
            {chainStore.chainInfos.map((chainInfo) => {
              return (
                <DropdownItem
                  key={chainInfo.chainId}
                  onClick={(e) => {
                    e.preventDefault();

                    setSelectedChainId(chainInfo.chainId);
                  }}
                >
                  {chainInfo.chainName}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </ButtonDropdown> */}
        {basicAccessInfo.origins.map((origin) => {
          return (
            <div
              key={origin}
              className={styleConnections.connectBox}
              onClick={async (e) => {
                e.preventDefault();

                if (
                  await confirm.confirm({
                    img: (
                      <img
                        alt="unlink"
                        src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=64`}
                        style={{ height: "64px" }}
                      />
                    ),
                    title: intl.formatMessage({
                      id: "setting.connections.confirm.delete-connection.title",
                    }),
                    paragraph: intl.formatMessage({
                      id:
                        "setting.connections.confirm.delete-connection.paragraph",
                    }),
                  })
                ) {
                  await basicAccessInfo.removeOrigin(origin);
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50px",
                  }}
                  src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=64`}
                />
                <div style={{ marginLeft: "11.36px" }}>
                  <div className={styleConnections.urlname}>
                    {origin.split("//")[1]}
                  </div>
                </div>
              </div>
              <img
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50px",
                }}
                src={"https://proofwalletsvgs.s3.amazonaws.com/error"}
              />
            </div>
          );
        })}
        <div style={{ height: "70px", color: "transparent" }} />
        <div className={styleConnections.footer}>
          <Button
            data-loading={loading}
            className={styleConnections.button}
            onClick={() => {
              setLoading(true);
              Promise.all(
                basicAccessInfo.origins.map(async (origin) => {
                  await basicAccessInfo.removeOrigin(origin);
                })
              );
              setLoading(false);
            }}
          >
            Remove all
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
});
