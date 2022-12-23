import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";

import style from "./style.module.scss";
import { WarningView } from "./warning-view";

interface FormData {
  password: string;
}

export const ResetSeedPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  const { keyRingStore, analyticsStore } = useStore();
  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

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
        <WarningView />
        <Form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true);
            try {
              // Make sure that password is valid and keyring is cleared.
              await keyRingStore.resetKeyRing(data.password);
              analyticsStore.logEvent("All accounts removed");
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
            name="password"
            error={errors.password && errors.password.message}
            ref={register({
              required: intl.formatMessage({
                id: "setting.clear.input.password.error.required",
              }),
            })}
          />
          <div className={style.comment}>
            This action will remove all account in this wallet
          </div>
          <div className={style.footer}>
            <div className={style.button} onClick={() => history.replace("/")}>
              Cancel
            </div>
            <Button
              type="submit"
              block
              className={style.buttonActive}
              data-loading={loading}
            >
              Reset
            </Button>
          </div>
        </Form>
      </div>
    </HeaderLayout>
  );
});
