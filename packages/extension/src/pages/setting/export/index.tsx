import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { HeaderLayout } from "../../../layouts";

import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useIntl } from "react-intl";
import { PasswordInput } from "../../../components/form";
import { Button, Form } from "reactstrap";
import useForm from "react-hook-form";
import { WarningView } from "./warning-view";

import classnames from "classnames";
import queryString from "query-string";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { flowResult } from "mobx";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<{ index: string; type?: string }>();
  const intl = useIntl();

  const { keyRingStore } = useStore();

  const query = queryString.parse(location.search);

  const type = query.type ?? "mnemonic";

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

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

  useEffect(() => {
    if (keyRing.length > 0) {
      const link = document.createElement("a");

      // Create a blog object with the file content which you want to add to the file
      const file = new Blob([keyRing], {
        type: "text/plain",
      });

      // Add file content in the object URL
      link.href = URL.createObjectURL(file);

      // Add file name
      link.download = "key.txt";

      // Add click event to <a> tag to save file.
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, [keyRing]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id:
          type === "mnemonic" ? "setting.export" : "setting.export.private-key",
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {keyRing ? (
          <div
            className={classnames(style.mnemonic, {
              [style.altHex]: type !== "mnemonic",
            })}
          >
            {keyRing}
          </div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={handleSubmit(async (data) => {
                setLoading(true);
                try {
                  setKeyRing(
                    await flowResult(
                      keyRingStore.showKeyRing(
                        parseInt(match.params.index),
                        data.password
                      )
                    )
                  );
                } catch (e) {
                  console.log("Fail to decrypt: " + e.message);
                  setError(
                    "password",
                    "invalid",
                    intl.formatMessage({
                      id: "setting.export.input.password.error.invalid",
                    })
                  );
                } finally {
                  setLoading(false);
                }
              })}
            >
              <PasswordInput
                // label={intl.formatMessage({
                //   id: "setting.export.input.password",
                // })}
                placeholder="Enter your password"
                name="password"
                error={errors.password && errors.password.message}
                ref={register({
                  required: intl.formatMessage({
                    id: "setting.export.input.password.error.required",
                  }),
                })}
              />
              <div className={style.comment}>
                <div>
                  Anyone with your private key can access your wallet and steal
                  any assets held in you account.
                </div>
                <div style={{ fontWeight: 600 }}>
                  ProofWallet Staff will never ask you for your private key.
                </div>
              </div>
              <div className={style.footer}>
                <div
                  className={style.button}
                  onClick={() => history.replace("/")}
                >
                  Cancel
                </div>
                <Button
                  type="submit"
                  block
                  className={style.buttonActive}
                  data-loading={loading}
                >
                  Export
                </Button>
              </div>
            </Form>
          </React.Fragment>
        )}
      </div>
    </HeaderLayout>
  );
});
