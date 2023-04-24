import React, {
  FunctionComponent,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory, useRouteMatch } from "react-router";
import { useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
import { Bech32Address } from "@proof-wallet/cosmos";

import style from "./style.module.scss";
import { WarningView } from "./warning-view";

interface FormData {
  password: string;
}

export const createShortenName = (name: string) => {
  if (name === "") {
    return "";
  } else if (name.indexOf(" ") > 0 && name.indexOf(" ") < name.length - 1) {
    return name[0] + name[name.indexOf(" ") + 1];
  } else {
    return name[0];
  }
};

export const ClearPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const match = useRouteMatch<{ index: string }>();

  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore, analyticsStore } = useStore();
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (parseInt(match.params.index).toString() !== match.params.index) {
      throw new Error("Invalid index");
    }
  }, [match.params.index]);

  const keyStore = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo[parseInt(match.params.index)];
  }, [keyRingStore.multiKeyStoreInfo, match.params.index]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.clear",
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {keyStore ? (
          <WarningView
            index={parseInt(match.params.index)}
            keyStore={keyStore}
          />
        ) : null}

        <div className={style.walletWrap}>
          <div className={style.walletIcon}>
            {createShortenName(accountInfo.name)}
          </div>

          <div className={style.walletInfoWrap}>
            <div className={style.walletName}>{accountInfo.name}</div>

            <div className={style.walletAddy}>
              {Bech32Address.shortenAddress(accountInfo.bech32Address, 13)}
            </div>
          </div>
        </div>

        <Form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            try {
              // Make sure that password is valid and keyring is cleared.
              await keyRingStore.deleteKeyRing(
                parseInt(match.params.index),
                data.password
              );
              analyticsStore.logEvent("Account removed");

              history.push("/");
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setError(
                "password",
                "invalid",
                intl.formatMessage({
                  id: "setting.clear.input.password.error.invalid",
                })
              );
              setLoading(false);
            }
          })}
        >
          <PasswordInput
            // label={intl.formatMessage({
            //   id: "setting.clear.input.password",
            // })}
            className={style.password}
            name="password"
            placeholder="Enter your password"
            error={errors.password && errors.password.message}
            ref={register({
              required: intl.formatMessage({
                id: "setting.clear.input.password.error.required",
              }),
            })}
          />
          <div className={style.comment}>
            <span>Make sure you have the </span>
            <span style={{ fontWeight: 600 }}>secret recovery phrase</span>
            <span>
              {" "}
              for this wallet before removing, otherwise it will be lost
              forever.
            </span>
          </div>
          <div className={style.footer}>
            <div
              style={{ marginRight: "8px" }}
              className={style.button}
              onClick={() => history.replace("/")}
            >
              Back
            </div>
            <Button
              type="submit"
              block
              className={style.buttonActive}
              data-loading={loading}
            >
              Remove
            </Button>
          </div>
        </Form>
      </div>
    </HeaderLayout>
  );
});
