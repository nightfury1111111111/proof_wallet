import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import { PasswordInput } from "../../components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import style from "./style.module.scss";

import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@proof-wallet/hooks";
import { useHistory } from "react-router";
import delay from "delay";
import { StartAutoLockMonitoringMsg } from "@proof-wallet/background";
import { InExtensionMessageRequester } from "@proof-wallet/router-extension";
import { BACKGROUND_PORT } from "@proof-wallet/router";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const passwordRef = useRef<HTMLInputElement | null>();

  const {
    register,
    handleSubmit,
    setError,
    errors,
    formState,
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const { keyRingStore, uiConfigStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  useEffect(() => {
    console.log(formState);
    if (formState.touched[0] === "password" && formState.submitCount > 0) {
      //console.log("error alert");
      setIsError(true);
    } else {
      setIsError(false);
    }

    //console.log(isError, errors, formState.touched[0]);
  }, [formState]);

  // useEffect(() => {
  //   if (passwordRef.current) {
  //     // Focus the password input on enter.
  //     passwordRef.current.focus();
  //   }
  // }, []);

  return (
    <EmptyLayout
      // style={{
      //   position: "relative",
      //   backgroundColor: "#131313",
      //   backgroundImage: 'url("../../public/assets/img/grid.png")',
      //   backgroundSize: "cover",
      //   height: "100%",
      // }}
      className={style.layout}
    >
      <div className={style.header}>
        <img
          className={style.headerLogo}
          src={require("../../public/assets/img/logo-title.svg")}
        />
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);

            const msg = new StartAutoLockMonitoringMsg();
            const requester = new InExtensionMessageRequester();
            // Make sure to notify that auto lock service to start check locking after duration.
            await requester.sendMessage(BACKGROUND_PORT, msg);

            if (interactionInfo.interaction) {
              if (!interactionInfo.interactionInternal) {
                // XXX: If the connection doesn't have the permission,
                //      permission service tries to grant the permission right after unlocking.
                //      Thus, due to the yet uncertain reason, it requests new interaction for granting permission
                //      before the `window.close()`. And, it could make the permission page closed right after page changes.
                //      Unfortunately, I still don't know the exact cause.
                //      Anyway, for now, to reduce this problem, jsut wait small time, and close the window only if the page is not changed.
                await delay(100);
                if (window.location.href.includes("#/unlock")) {
                  window.close();
                }
              } else {
                history.replace("/");
              }
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid",
              })
            );
            setLoading(false);
          }
        })}
      >
        <div style={{ marginTop: "57px", marginBottom: "20px" }}>
          <Banner
            icon={
              uiConfigStore.isBeta
                ? require("../../public/assets/256.png")
                : "https://proofwalletsvgs.s3.amazonaws.com/logo.svg"
            }
            logo={require("../../public/assets/brand-text.png")}
            title="Enter your password"
            subtitle=""
          />
        </div>
        <div style={{ height: "5px" }} />
        <PasswordInput
          // label={intl.formatMessage({
          //   id: "lock.input.password",
          // })}
          className={`${style.password} ${isError ? style.showError : ""}`}
          name="password"
          placeholder="Enter your password"
          error={errors.password && errors.password.message}
          ref={(ref) => {
            passwordRef.current = ref;

            register({
              required: intl.formatMessage({
                id: "lock.input.password.error.required",
              }),
            })(ref);
          }}
        />

        <img
          className={style.errorImg}
          hidden={!isError}
          src={require("../../public/assets/svg/error-cross.svg")}
        />

        <a //TODO FORGOT PASSWORD
          href="#"
          className={style.forgotPassword}
        >
          Forgot password
        </a>

        <Button
          type="submit"
          // color="primary"
          className={style.unlockBtn}
          block
          data-loading={loading}
        >
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
