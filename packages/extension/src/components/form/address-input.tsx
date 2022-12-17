import React, { FunctionComponent, useMemo, useState } from "react";
import {
  FormGroup,
  Label,
  Input,
  FormFeedback,
  ModalBody,
  Modal,
  // InputGroup,
  // Button,
  FormText,
} from "reactstrap";
import { AddressBookPage } from "../../pages/setting/address-book";

import styleAddressInput from "./address-input.module.scss";
import classnames from "classnames";
import {
  InvalidBech32Error,
  EmptyAddressError,
  IRecipientConfig,
  IMemoConfig,
  ENSNotSupportedError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  IIBCChannelConfig,
  InvalidHexError,
} from "@proof-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { ObservableEnsFetcher } from "@proof-wallet/ens";

export interface AddressInputProps {
  recipientConfig: IRecipientConfig;
  memoConfig?: IMemoConfig;
  ibcChannelConfig?: IIBCChannelConfig;

  className?: string;
  label?: string;

  disableAddressBook?: boolean;

  disabled?: boolean;
}

export const AddressInput: FunctionComponent<AddressInputProps> = observer(
  ({
    recipientConfig,
    memoConfig,
    ibcChannelConfig,
    className,
    label,
    disableAddressBook,
    disabled = false,
  }) => {
    const intl = useIntl();

    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
    const [focused, setFocused] = useState(false);

    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    const isENSAddress = ObservableEnsFetcher.isValidENS(
      recipientConfig.rawRecipient
    );

    const error = recipientConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-bech32",
            });
          case ENSNotSupportedError:
            return intl.formatMessage({
              id: "input.recipient.error.ens-not-supported",
            });
          case ENSFailedToFetchError:
            return intl.formatMessage({
              id: "input.recipient.error.ens-failed-to-fetch",
            });
          case ENSIsFetchingError:
            return;
          case InvalidHexError:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-hex",
            });
          default:
            return intl.formatMessage({ id: "input.recipient.error.unknown" });
        }
      }
    }, [intl, error]);

    const isENSLoading: boolean = error instanceof ENSIsFetchingError;

    const selectAddressFromAddressBook = {
      setRecipient: (recipient: string) => {
        recipientConfig.setRawRecipient(recipient);
      },
      setMemo: (memo: string) => {
        if (memoConfig) {
          memoConfig.setMemo(memo);
        }
      },
    };

    return (
      <React.Fragment>
        <Modal
          isOpen={isAddressBookOpen}
          backdrop={false}
          className={styleAddressInput.fullModal}
          wrapClassName={styleAddressInput.fullModal}
          contentClassName={styleAddressInput.fullModal}
        >
          <ModalBody className={styleAddressInput.fullModal}>
            <AddressBookPage
              onBackButton={() => setIsAddressBookOpen(false)}
              hideChainDropdown={true}
              selectHandler={selectAddressFromAddressBook}
              ibcChannelConfig={ibcChannelConfig}
            />
          </ModalBody>
        </Modal>
        <FormGroup className={className}>
          {label ? (
            <Label for={inputId} className="form-control-label">
              {label}
            </Label>
          ) : null}
          <div className={styleAddressInput.inputGroup}>
            <div
              className={styleAddressInput.inputWrapper}
              style={
                focused
                  ? {
                      border: "4px solid rgba(255, 212, 138, 0.3)",
                      // transform: "translate(-4px, -4px)",
                    }
                  : {}
              }
            >
              <Input
                id={inputId}
                className={classnames(
                  // "form-control-alternative",
                  styleAddressInput.input
                )}
                style={!disableAddressBook ? { paddingRight: "67px" } : {}}
                placeholder="Address"
                value={recipientConfig.rawRecipient}
                spellCheck={false}
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
                onChange={(e) => {
                  e.preventDefault();
                  recipientConfig.setRawRecipient(e.target.value);
                }}
                autoComplete="off"
                disabled={disabled}
              />
            </div>
            {!disableAddressBook && memoConfig ? (
              <div
                className={styleAddressInput.addressBookButton}
                onClick={() => setIsAddressBookOpen(true)}
              >
                <img
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50px",
                  }}
                  src={require("../../public/assets/img/address.svg")}
                />
              </div>
            ) : null}
          </div>
          {isENSLoading ? (
            <FormText>
              <i className="fa fa-spinner fa-spin fa-fw" />
            </FormText>
          ) : null}
          {!isENSLoading && isENSAddress && !error ? (
            <FormText>{recipientConfig.recipient}</FormText>
          ) : null}
          {errorText != null ? (
            <FormFeedback style={{ display: "block" }}>
              {errorText}
            </FormFeedback>
          ) : null}
        </FormGroup>
      </React.Fragment>
    );
  }
);
