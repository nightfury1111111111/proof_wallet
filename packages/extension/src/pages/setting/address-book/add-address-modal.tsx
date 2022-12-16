import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../layouts";
import { AddressInput, Input } from "../../../components/form";
import { Button } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import {
  AddressBookConfig,
  MemoConfig,
  RecipientConfig,
} from "@proof-wallet/hooks";

import styleAddressBook from "./style.module.scss";

/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding address book. If index is equal or greater than 0, it is considered as editing address book.
 * @param addressBookKVStore
 * @constructor
 */
export const AddAddressModal: FunctionComponent<{
  closeModal: () => void;
  recipientConfig: RecipientConfig;
  memoConfig: MemoConfig;
  addressBookConfig: AddressBookConfig;
  index: number;
  chainId: string;
}> = observer(
  ({ closeModal, recipientConfig, memoConfig, addressBookConfig, index }) => {
    const intl = useIntl();

    const [name, setName] = useState("");
    const [colorIdx, setColorIdx] = useState(0);
    const [colors] = useState<Array<string>>(["#FFD48A", "#4A3210", "#BD69FF"]);
    const [shortName, setShortName] = useState("");

    useEffect(() => {
      if (index >= 0) {
        const data = addressBookConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        memoConfig.setMemo(data.memo);
      }
    }, [
      addressBookConfig.addressBookDatas,
      index,
      memoConfig,
      recipientConfig,
    ]);

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={
          index >= 0
            ? intl.formatMessage({
                id: "setting.address-book.edit-address.title",
              })
            : intl.formatMessage({
                id: "setting.address-book.add-address.title",
              })
        }
        onBackButton={() => {
          // Clear the recipient and memo before closing
          recipientConfig.setRawRecipient("");
          memoConfig.setMemo("");
          closeModal();
        }}
      >
        <form
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div
            style={{
              height: "139px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className={styleAddressBook.shortName}
              style={{ background: colors[colorIdx] }}
            >
              {shortName.toUpperCase()}
            </div>
          </div>
          <Input
            type="text"
            label={intl.formatMessage({ id: "setting.address-book.name" })}
            autoComplete="off"
            value={name}
            onChange={(e) => {
              if (e.target.value.startsWith(" ")) return;

              setName(e.target.value);
              if (e.target.value === "") {
                setShortName("");
                return;
              } else if (
                e.target.value.indexOf(" ") > 0 &&
                e.target.value.indexOf(" ") < e.target.value.length - 1
              ) {
                setShortName(
                  e.target.value[0] +
                    e.target.value[e.target.value.indexOf(" ") + 1]
                );
                return;
              } else {
                setShortName(e.target.value[0]);
                return;
              }
            }}
          />
          <AddressInput
            recipientConfig={recipientConfig}
            label={intl.formatMessage({ id: "setting.address-book.address" })}
            disableAddressBook={true}
          />
          <div style={{ marginTop: "39px" }}>
            <div className={styleAddressBook.colorContainer}>
              <div
                className={styleAddressBook.colorBox}
                style={colorIdx === 0 ? { border: "2px solid #7EFF9B" } : {}}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50px",
                    background: colors[0],
                  }}
                  onClick={() => {
                    setColorIdx(0);
                  }}
                />
              </div>
              <div
                className={styleAddressBook.colorBox}
                style={colorIdx === 1 ? { border: "2px solid #7EFF9B" } : {}}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50px",
                    background: colors[1],
                  }}
                  onClick={() => {
                    setColorIdx(1);
                  }}
                />
              </div>
              <div
                className={styleAddressBook.colorBox}
                style={colorIdx === 2 ? { border: "2px solid #7EFF9B" } : {}}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50px",
                    background: colors[2],
                  }}
                  onClick={() => {
                    setColorIdx(2);
                  }}
                />
              </div>
            </div>
          </div>
          {/* <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "setting.address-book.memo" })}
          />*/}
          <div className={styleAddressBook.footer}>
            <Button
              className={styleAddressBook.button}
              onClick={() => {
                // Clear the recipient and memo before closing
                recipientConfig.setRawRecipient("");
                memoConfig.setMemo("");
                closeModal();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styleAddressBook.buttonActive}
              // color="primary"
              disabled={
                !name ||
                recipientConfig.error != null ||
                memoConfig.error != null
              }
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!recipientConfig.recipient) {
                  throw new Error("Invalid address");
                }

                if (index < 0) {
                  await addressBookConfig.addAddressBook({
                    name,
                    address: recipientConfig.recipient,
                    memo: memoConfig.memo,
                    bgColor: "",
                  });
                } else {
                  await addressBookConfig.editAddressBookAt(index, {
                    name,
                    address: recipientConfig.recipient,
                    memo: memoConfig.memo,
                    bgColor: colors[colorIdx],
                  });
                }

                // Clear the recipient and memo before closing
                recipientConfig.setRawRecipient("");
                memoConfig.setMemo("");
                closeModal();
              }}
            >
              <FormattedMessage id={"setting.address-book.button.save"} />
            </Button>
          </div>
        </form>
      </HeaderLayout>
    );
  }
);
