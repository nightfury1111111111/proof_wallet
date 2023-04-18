import React, { FunctionComponent, ReactNode } from "react";

import { Header as CompHeader } from "../../components/header";

import { observer } from "mobx-react-lite";
// import { useStore } from "../../stores";

import style from "./style.module.scss";
// import { ToolTip } from "../../components/tooltip";

// import { ChainList } from "./chain-list";
import { AccountView } from "../../pages/main/account";
import { Menu, useMenu, MenuButton } from "../menu";

import { motion } from "framer-motion";
import { useLocation } from "react-router";

export interface Props {
  showChainName: boolean;
  canChangeChainInfo: boolean;

  alternativeTitle?: string;
  menuRenderer?: ReactNode;
  rightRenderer?: ReactNode;
  onBackButton?: () => void;
}

export interface LocalProps {
  isMenuOpen: boolean;
}

export const Header: FunctionComponent<Props & LocalProps> = observer(
  ({
    // showChainName,
    // canChangeChainInfo,
    // alternativeTitle,
    menuRenderer,
    rightRenderer,
    isMenuOpen,
    onBackButton,
  }) => {
    // const { chainStore } = useStore();
    const location = useLocation();
    console.log(location);
    const menu = useMenu();

    // const chainInfoChangable =
    //   canChangeChainInfo &&
    //   chainStore.chainInfos.length > 1 &&
    //   alternativeTitle == null;

    return (
      <CompHeader
        // fixed
        left={
          <div className={style.menuContainer}>
            {menuRenderer ? (
              <React.Fragment>
                <Menu isOpen={isMenuOpen}>{menuRenderer}</Menu>
                <motion.div
                  className={`${style["menu-img"]} ${
                    isMenuOpen ? style["open-menu"] : ""
                  }`}
                  style={{ zIndex: 901 }}
                  animate={isMenuOpen ? "open" : "closed"}
                  onClick={menu.toggle}
                >
                  <MenuButton />
                </motion.div>
              </React.Fragment>
            ) : null}
            {onBackButton ? (
              <div
                className={style["menu-img"]}
                onClick={() => {
                  if (onBackButton) {
                    onBackButton();
                  }
                }}
              >
                {/*<i
                  className="fas fa-thin fa-arrow-left"
                  style={{ color: "#959595" }}
                /> 
                 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  style={{
                    width: "34px",
                    height: "18px",
                    marginLeft: "-14px",
                  }}
                >
                  <path
                    fill="transparent"
                    strokeWidth="2"
                    stroke="#959595"
                    strokeLinecap="round"
                    d="M 6.5 10 L 13.5 3.5 M 6.5 10 L 13.5 16.5"
                  />
                  <path
                    d="M16 1.00037L1.42448 1.00037"
                    stroke="#959595"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(8, 9)"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        }
        right={rightRenderer}
      >
        {/* {showChainName || alternativeTitle ? (
          <ToolTip
            trigger={chainInfoChangable ? "click" : "static"}
            tooltip={<ChainList />}
          >
            <div
              className={style.chainListContainer}
              style={{ cursor: chainInfoChangable ? undefined : "default" }}
            >
              <div className={style.title}>
                {showChainName
                  ? chainStore.current.chainName
                  : alternativeTitle}
              </div>

              {chainInfoChangable ? (
                <div className={style.titleIconContainer}>
                  <svg
                    className={style.titleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
                  </svg>
                </div>
              ) : null}
            </div>
          </ToolTip>
        ) : null} */}
        {location.pathname === "/setting/address-book" ? (
          <div className={style.headerTitle}>Address Book</div>
        ) : location.pathname === "/setting/language" ? (
          <div className={style.headerTitle}>Language</div>
        ) : location.pathname === "/setting" ? (
          <div className={style.headerTitle}>Security & Privacy</div>
        ) : location.pathname.includes("/setting/clear") ? (
          <div className={style.headerTitle}>Remove Wallet</div>
        ) : location.pathname.includes("/setting/connections") ? (
          <div className={style.headerTitle}>Trusted Apps</div>
        ) : location.pathname.includes("/setting/export") ? (
          <div className={style.headerTitle}>Export Private Key</div>
        ) : location.pathname === "/setting/autolock" ? (
          <div className={style.headerTitle}>Auto Lock Time</div>
        ) : location.pathname === "/setting/change-password" ? (
          <div className={style.headerTitle}>Change Password</div>
        ) : location.pathname === "/setting/reset-seed" ? (
          <div className={style.headerTitle}>Reset Seed Phrase</div>
        ) : location.pathname === "/deposit" ? (
          <div className={style.headerTitle}>Deopsit</div>
        ) : location.pathname === "/nft" ? (
          <div className={style.headerTitle}>NFT</div>
        ) : location.pathname === "/send-nft" ? (
          <div className={style.headerTitle}>Send NFT</div>
        ) : location.pathname === "/setting/set-keyring" ? (
          <div className={style.headerTitle}>Select Wallet</div>
        ) : (
          <AccountView />
        )}
      </CompHeader>
    );
  }
);
