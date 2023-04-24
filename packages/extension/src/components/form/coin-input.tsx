import React, { FunctionComponent, useMemo, useState } from "react";

import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";

import {
  // ButtonDropdown,
  // DropdownItem,
  // DropdownMenu,
  // DropdownToggle,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { observer } from "mobx-react-lite";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  ZeroAmountError,
  NegativeAmountError,
  InsufficientAmountError,
  IAmountConfig,
} from "@proof-wallet/hooks";
import { CoinPretty, Dec, DecUtils, Int } from "@proof-wallet/unit";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";

export interface CoinInputProps {
  amountConfig: IAmountConfig;

  balanceText?: string;

  className?: string;
  label?: string;

  disableAllBalance?: boolean;
}

export const CoinInput: FunctionComponent<CoinInputProps> = observer(
  ({ amountConfig, className, label, disableAllBalance }) => {
    const intl = useIntl();
    const [focused, setFocused] = useState(false);

    const { queriesStore } = useStore();
    const queryBalances = queriesStore
      .get(amountConfig.chainId)
      .queryBalances.getQueryBech32Address(amountConfig.sender);

    const queryBalance = queryBalances.balances.find(
      (bal) =>
        amountConfig.sendCurrency.coinMinimalDenom ===
        bal.currency.coinMinimalDenom
    );
    const balance = queryBalance
      ? queryBalance.balance
      : new CoinPretty(amountConfig.sendCurrency, new Int(0));

    const [randomId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return Buffer.from(bytes).toString("hex");
    });

    const error = amountConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to user.
            return;
          case InvalidNumberAmountError:
            return intl.formatMessage({
              id: "input.amount.error.invalid-number",
            });
          case ZeroAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-zero",
            });
          case NegativeAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-negative",
            });
          case InsufficientAmountError:
            return intl.formatMessage({
              id: "input.amount.error.insufficient",
            });
          default:
            return intl.formatMessage({ id: "input.amount.error.unknown" });
        }
      }
    }, [intl, error]);

    // const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);

    // const selectableCurrencies = amountConfig.sendableCurrencies
    //   .filter((cur) => {
    //     const bal = queryBalances.getBalanceFromCurrency(cur);
    //     return !bal.toDec().isZero();
    //   })
    //   .sort((a, b) => {
    //     return a.coinDenom < b.coinDenom ? -1 : 1;
    //   });

    return (
      <React.Fragment>
        {/* <FormGroup className={className}>
          <Label
            for={`selector-${randomId}`}
            className="form-control-label"
            style={{ width: "100%" }}
          >
            <FormattedMessage id="component.form.coin-input.token.label" />
          </Label>
          <ButtonDropdown
            id={`selector-${randomId}`}
            className={classnames(styleCoinInput.tokenSelector, {
              disabled: amountConfig.isMax,
            })}
            isOpen={isOpenTokenSelector}
            toggle={() => setIsOpenTokenSelector((value) => !value)}
            disabled={amountConfig.isMax}
          >
            <DropdownToggle caret>
              {amountConfig.sendCurrency.coinDenom}
            </DropdownToggle>
            <DropdownMenu>
              {selectableCurrencies.map((currency) => {
                return (
                  <DropdownItem
                    key={currency.coinMinimalDenom}
                    active={
                      currency.coinMinimalDenom ===
                      amountConfig.sendCurrency.coinMinimalDenom
                    }
                    onClick={(e) => {
                      e.preventDefault();

                      amountConfig.setSendCurrency(currency);
                    }}
                  >
                    {currency.coinDenom}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
        </FormGroup> */}
        <FormGroup className={className}>
          {label ? (
            <Label
              for={`input-${randomId}`}
              className="form-control-label"
              style={{ display: "flex", fontWeight: 500 }}
            >
              <div style={{ color: "#959595", fontSize: "14px" }}>{label}</div>
              {!disableAllBalance ? (
                <div
                  className={classnames(
                    styleCoinInput.balance,
                    styleCoinInput.clickable,
                    {
                      [styleCoinInput.clicked]: amountConfig.isMax,
                    }
                  )}
                  onClick={(e) => {
                    e.preventDefault();

                    amountConfig.toggleIsMax();
                  }}
                >
                  {balance.trim(true).maxDecimals(6).toString()}
                </div>
              ) : null}
            </Label>
          ) : null}
          <div className={styleCoinInput.inputGroup}>
            <div
              className={styleCoinInput.inputWrapper}
              style={
                focused
                  ? {
                      //border: "4px solid rgba(255, 212, 138, 0.3)",
                      // transform: "translate(-4px, -4px)",
                    }
                  : {}
              }
            >
              <Input
                className={classnames(
                  "form-control-alternative",
                  styleCoinInput.input
                )}
                placeholder="0.00"
                id={`input-${randomId}`}
                type="number"
                value={amountConfig.amount}
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
                onChange={(e) => {
                  e.preventDefault();

                  amountConfig.setAmount(e.target.value);
                }}
                step={new Dec(1)
                  .quo(
                    DecUtils.getPrecisionDec(
                      amountConfig.sendCurrency?.coinDecimals ?? 0
                    )
                  )
                  .toString(amountConfig.sendCurrency?.coinDecimals ?? 0)}
                min={0}
                // disabled={amountConfig.isMax}
                autoComplete="off"
              />
            </div>
            <div className={styleCoinInput.maxButtonGroup}>
              <div
                style={{
                  color: "#696969",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "19px",
                  letterSpacing: "0.5px",
                }}
              >
                {balance.currency.coinDenom}
              </div>
              <div
                className={styleCoinInput.maxButton}
                onClick={(e) => {
                  e.preventDefault();

                  amountConfig.toggleIsMax();
                }}
              >
                MAX
              </div>
            </div>
          </div>
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
