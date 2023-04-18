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
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
      if (index >= 0) {
        const data = addressBookConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        memoConfig.setMemo(data.memo);
        setColorIdx(colors.indexOf(data.bgColor));
        setPinned(data.pinned);
      }
    }, [
      addressBookConfig.addressBookDatas,
      index,
      memoConfig,
      recipientConfig,
    ]);

    useEffect(() => {
      if (name === "") {
        setShortName("");
        return;
      } else if (name.indexOf(" ") > 0 && name.indexOf(" ") < name.length - 1) {
        setShortName(name[0] + name[name.indexOf(" ") + 1]);
        return;
      } else {
        setShortName(name[0]);
        return;
      }
    }, [name]);

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
              onClick={() => setPinned(!pinned)}
            >
              {shortName.toUpperCase()}
              <img
                className={styleAddressBook.pinStatus}
                src={
                  pinned
                    ? require("../../../public/assets/img/pinned.svg")
                    : require("../../../public/assets/img/unpinned.svg")
                }
              />
            </div>
          </div>
          <Input
            type="text"
            // style={{
            //   height: "52px",
            //   background: "rgb(0, 0, 0, 0.2)",
            //   border: "1px solid #323232",
            //   fontFamily: "colfax-web",
            //   fontWeight: 400,
            //   fontSize: "16px",
            //   lineHeight: "19px",
            //   color: "#E9E4DF",
            // }}
            // label={intl.formatMessage({ id: "setting.address-book.name" })}

            style={{
              color: "#E9E4DF",
              letterSpacing: "1px",
            }}
            className={styleAddressBook.inputStyle}
            autoComplete="off"
            placeholder="Name"
            spellCheck={false}
            value={name}
            onChange={(e) => {
              if (e.target.value.startsWith(" ")) return;
              setName(e.target.value);
            }}
          />
          <AddressInput
            recipientConfig={recipientConfig}
            // label={intl.formatMessage({ id: "setting.address-book.address" })}
            disableAddressBook={true}
          />
          <div style={{ marginTop: "9px" }}>
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
          <div
            style={{
              position: "absolute",
              bottom: "100px",
              width: "100%",
              textAlign: "center",
              left: "0",
            }}
          >
            {/**TODO ADD FUNC FOR DELETE */}
            <a
              href="#"
              style={{
                color: "#696969",
                fontSize: "14px",
                width: "100%",
              }}
            >
              Delete from the address book
            </a>
          </div>
          <div className={styleAddressBook.footer}>
            <Button
              className={styleAddressBook.button}
              style={{ marginRight: "4px" }}
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
                    bgColor: colors[colorIdx],
                    pinned,
                  });
                } else {
                  await addressBookConfig.editAddressBookAt(index, {
                    name,
                    address: recipientConfig.recipient,
                    memo: memoConfig.memo,
                    bgColor: colors[colorIdx],
                    pinned,
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
