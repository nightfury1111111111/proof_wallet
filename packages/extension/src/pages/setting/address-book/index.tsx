import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import {
  // Button,
  // ButtonDropdown,
  // DropdownItem,
  // DropdownMenu,
  // DropdownToggle,
  Modal,
  ModalBody,
} from "reactstrap";
import styleAddressBook from "./style.module.scss";
import { useStore } from "../../../stores";
import { PageButton } from "../page-button";
import { AddAddressModal } from "./add-address-modal";
import { ExtensionKVStore } from "@proof-wallet/common";
import { Bech32Address } from "@proof-wallet/cosmos";
import { useConfirm } from "../../../components/confirm";
import {
  AddressBookSelectHandler,
  IIBCChannelConfig,
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@proof-wallet/hooks";
import { EthereumEndpoint } from "../../../config.ui";

export const AddressBookPage: FunctionComponent<{
  onBackButton?: () => void;
  hideChainDropdown?: boolean;
  selectHandler?: AddressBookSelectHandler;
  ibcChannelConfig?: IIBCChannelConfig;
}> = observer(({ onBackButton, selectHandler, ibcChannelConfig }) => {
  const intl = useIntl();
  const history = useHistory();

  const { chainStore } = useStore();
  const current = chainStore.current;

  const [selectedChainId] = useState(
    ibcChannelConfig?.channel
      ? ibcChannelConfig.channel.counterpartyChainId
      : current.chainId
  );

  const recipientConfig = useRecipientConfig(chainStore, selectedChainId, {
    ensEndpoint: EthereumEndpoint,
    allowHexAddressOnEthermint: true,
  });
  const memoConfig = useMemoConfig(chainStore, selectedChainId);

  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    selectHandler
      ? selectHandler
      : {
          setRecipient: (): void => {
            // noop
          },
          setMemo: (): void => {
            // noop
          },
        }
  );

  // const [dropdownOpen, setOpen] = useState(false);
  // const toggle = () => setOpen(!dropdownOpen);

  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [addAddressModalIndex, setAddAddressModalIndex] = useState(-1);

  const [addresses, setAddresses] = useState<
    Array<{
      name: string;
      address: string;
      memo: string;
      bgColor: string;
      pinned: boolean;
      realIndex: number;
    }>
  >([]);

  const confirm = useConfirm();

  const sortArray = async () => {
    const tmpPinnedAddress: Array<{
      name: string;
      address: string;
      memo: string;
      bgColor: string;
      pinned: boolean;
      realIndex: number;
    }> = [];
    const tmpUnpinnedAddress: Array<{
      name: string;
      address: string;
      memo: string;
      bgColor: string;
      pinned: boolean;
      realIndex: number;
    }> = [];
    await Promise.all(
      addressBookConfig.addressBookDatas.map((data, idx) => {
        if (data.pinned) tmpPinnedAddress.push({ ...data, realIndex: idx });
        else tmpUnpinnedAddress.push({ ...data, realIndex: idx });
      })
    );
    setAddresses(tmpPinnedAddress.concat(tmpUnpinnedAddress));
  };

  useEffect(() => {
    sortArray();
  }, [addressBookConfig.addressBookDatas]);

  const addressBookIcons = (index: number) => {
    return [
      // <i
      //   key="edit"
      //   className="fas fa-pen"
      //   style={{ cursor: "pointer" }}
      //   onClick={(e) => {
      //     e.preventDefault();
      //     e.stopPropagation();

      //     setAddAddressModalOpen(true);
      //     setAddAddressModalIndex(index);
      //   }}
      // />,
      <i
        key="remove"
        className="fas fa-trash"
        style={{ cursor: "pointer" }}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (
            await confirm.confirm({
              img: (
                <img
                  src={require("../../../public/assets/img/trash.svg")}
                  style={{ height: "80px" }}
                />
              ),
              title: intl.formatMessage({
                id: "setting.address-book.confirm.delete-address.title",
              }),
              paragraph: intl.formatMessage({
                id: "setting.address-book.confirm.delete-address.paragraph",
              }),
            })
          ) {
            setAddAddressModalOpen(false);
            setAddAddressModalIndex(-1);
            await addressBookConfig.removeAddressBook(index);
          }
        }}
      />,
    ];
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.address-book",
      })}
      onBackButton={
        onBackButton
          ? onBackButton
          : () => {
              history.goBack();
            }
      }
    >
      <Modal
        isOpen={addAddressModalOpen}
        backdrop={false}
        className={styleAddressBook.fullModal}
        wrapClassName={styleAddressBook.fullModal}
        contentClassName={styleAddressBook.fullModal}
      >
        <ModalBody className={styleAddressBook.fullModal}>
          <AddAddressModal
            closeModal={() => {
              setAddAddressModalOpen(false);
              setAddAddressModalIndex(-1);
            }}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            addressBookConfig={addressBookConfig}
            index={addAddressModalIndex}
            chainId={selectedChainId}
          />
        </ModalBody>
      </Modal>
      <div className={styleAddressBook.container}>
        {/* <div style={{ flex: "1 1 0", overflowY: "auto" }}> */}
        {addresses.map((data, i) => {
          let avatarName = "";
          if (data.name === "") {
            avatarName = "";
          } else if (
            data.name.indexOf(" ") > 0 &&
            data.name.indexOf(" ") < data.name.length - 1
          ) {
            avatarName = data.name[0] + data.name[data.name.indexOf(" ") + 1];
          } else {
            avatarName = data.name[0];
          }
          return (
            <PageButton
              key={i.toString()}
              avatarName={avatarName}
              avatarColor={data.bgColor}
              pinned={data.pinned}
              title={data.name}
              paragraph={
                // data.address.indexOf(
                //   chainStore.getChain(selectedChainId).bech32Config
                //     .bech32PrefixAccAddr
                // ) === 0
                //   ? Bech32Address.shortenAddress(data.address, 16)
                //   : data.address
                Bech32Address.shortenAddress(data.address, 16)
              }
              subParagraph={data.memo}
              icons={addressBookIcons(data.realIndex)}
              data-index={data.realIndex}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setAddAddressModalOpen(true);
                setAddAddressModalIndex(data.realIndex);

                addressBookConfig.selectAddressAt(data.realIndex);

                if (onBackButton) {
                  onBackButton();
                }
              }}
              style={{
                // cursor: selectHandler ? undefined : "auto",
                marginBottom: "9px",
              }}
            />
          );
        })}
        {/* </div> */}
        <div
          className={styleAddressBook.innerTopContainer}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setAddAddressModalOpen(true);
          }}
        >
          {/* {hideChainDropdown ? null : (
              <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                <DropdownToggle caret style={{ boxShadow: "none" }}>
                  {chainStore.getChain(selectedChainId).chainName}
                </DropdownToggle>
                <DropdownMenu>
                  {chainStore.chainInfos.map((chainInfo) => {
                    return (
                      <DropdownItem
                        key={chainInfo.chainId}
                        onClick={() => {
                          setSelectedChainId(chainInfo.chainId);
                        }}
                      >
                        {chainInfo.chainName}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </ButtonDropdown>
            )}
            <div style={{ flex: 1 }} /> */}

          <FormattedMessage id="setting.address-book.button.add" />
        </div>
      </div>
    </HeaderLayout>
  );
});
