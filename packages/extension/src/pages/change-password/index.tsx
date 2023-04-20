import React, { FunctionComponent, useState, useEffect, useRef } from "react";

import { PasswordInput } from "../../components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import useForm from "react-hook-form";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";

import { useIntl } from "react-intl";
import { useHistory } from "react-router";

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();
  const passwordRef = useRef<HTMLInputElement | null>();

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    errors,
  } = useForm<FormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (passwordRef.current) {
      // Focus the password input on enter.
      passwordRef.current.focus();
    }
  }, []);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      style={{ height: "auto", minHeight: "100%" }}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          const isValidPassword = await keyRingStore.checkPassword(
            data.currentPassword
          );
          if (!isValidPassword) {
            setError(
              "currentPassword",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid",
              })
            );
            setLoading(false);
            return;
          } else {
            try {
              await keyRingStore.changePassword(
                data.currentPassword,
                data.newPassword
              );
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
              setLoading(false);
            }
          }
          setLoading(false);
          history.goBack();
        })}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            className={style.image}
            src={require("../../public/assets/img/lock_icon.svg")}
          />
        </div>
        <div className={style.title}>Change Password</div>
        <PasswordInput
          className={style.password}
          formGroupClassName={style.passwordWrapper}
          name="currentPassword"
          placeholder="Current Password"
          error={errors.currentPassword && errors.currentPassword.message}
          ref={(ref) => {
            passwordRef.current = ref;
            register({
              required: intl.formatMessage({
                id: "lock.input.password.error.required",
              }),
            })(ref);
          }}
        />
        <PasswordInput
          name="newPassword"
          className={style.password}
          formGroupClassName={style.passwordWrapper}
          placeholder="New Password"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.password.error.required",
            }),
            validate: (password: string): string | undefined => {
              if (password.length < 8) {
                return intl.formatMessage({
                  id: "register.create.input.password.error.too-short",
                });
              }
            },
          })}
          error={errors.newPassword && errors.newPassword.message}
        />
        <PasswordInput
          name="confirmPassword"
          className={style.password}
          formGroupClassName={style.passwordWrapper}
          placeholder="Confirm Password"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.confirm-password.error.required",
            }),
            validate: (confirmPassword: string): string | undefined => {
              if (confirmPassword !== getValues()["newPassword"]) {
                return "Confirm password";
              }
            },
          })}
          error={errors.confirmPassword && errors.confirmPassword.message}
        />
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
            Save
          </Button>
        </div>
      </Form>
    </HeaderLayout>
  );
});
