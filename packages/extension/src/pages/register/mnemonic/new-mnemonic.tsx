import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { RegisterConfig } from "@proof-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import useForm from "react-hook-form";
import {
  // AdvancedBIP44Option,
  BIP44Option,
  useBIP44Option,
} from "../advanced-bip44";
import style from "../style.module.scss";
import { Button, Form } from "reactstrap";
import { Input, PasswordInput } from "../../../components/form";
import { BackButton } from "../index";
import { NewMnemonicConfig, useNewMnemonicConfig } from "./hook";
import { useStore } from "../../../stores";

export const TypeNewMnemonic = "new-mnemonic";

interface FormData {
  name: string;
  words: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      // color="primary"
      // outline
      // block
      // size="lg"
      className={style.createBtn}
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeNewMnemonic);
        analyticsStore.logEvent("Create account started", {
          registerType: "seed",
        });
      }}
    >
      <div
        style={{
          width: "57px",
          height: "57px",
          borderRadius: "10px",
          background: "rgba(255, 207, 138, 0.1)",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <i className="fas fa-solid fa-plus" style={{ color: "#FFD48A" }} />
      </div>
      <FormattedMessage id="register.intro.button.new-account.title" />
    </Button>
  );
});

export const NewMnemonicPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const bip44Option = useBIP44Option();

  return (
    <React.Fragment>
      {newMnemonicConfig.mode === "password" ? (
        <AddPassswordModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
        />
      ) : null}
      {newMnemonicConfig.mode === "generate" ? (
        <GenerateMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
        />
      ) : null}
      {newMnemonicConfig.mode === "verify" ? (
        <VerifyMnemonicModePage
          registerConfig={registerConfig}
          newMnemonicConfig={newMnemonicConfig}
          bip44Option={bip44Option}
        />
      ) : null}
    </React.Fragment>
  );
});

export const AddPassswordModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
}> = observer(({ registerConfig, newMnemonicConfig }) => {
  const intl = useIntl();

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: newMnemonicConfig.name,
      words: newMnemonicConfig.mnemonic,
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div style={{ width: "100%" }}>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          newMnemonicConfig.setName(data.name);
          newMnemonicConfig.setPassword(data.password);

          newMnemonicConfig.setMode("generate");
        })}
      >
        <BackButton
          onClick={() => {
            registerConfig.clear();
          }}
        />
        {registerConfig.mode === "create" ? (
          <div className={style.passwordTitle}>
            Set a password for your Wallet
          </div>
        ) : (
          <div className={style.passwordTitle}>Set account name</div>
        )}
        <Input
          // label={intl.formatMessage({
          //   id: "register.name",
          // })}
          className={style.inputBox}
          type="text"
          name="name"
          placeholder="Enter account name"
          ref={register({
            required: intl.formatMessage({
              id: "register.name.error.required",
            }),
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === "create" ? (
          <React.Fragment>
            <PasswordInput
              // label={intl.formatMessage({
              //   id: "register.create.input.password",
              // })}
              name="password"
              className={style.inputBox}
              placeholder="Create password"
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
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              // label={intl.formatMessage({
              //   id: "register.create.input.confirm-password",
              // })}
              name="confirmPassword"
              className={style.inputBox}
              placeholder="Re-enter password"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.confirm-password.error.required",
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()["password"]) {
                    return intl.formatMessage({
                      id:
                        "register.create.input.confirm-password.error.unmatched",
                    });
                  }
                },
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        {/* <AdvancedBIP44Option bip44Option={bip44Option} /> */}
        <Button className={style.nextBtn} type="submit" block size="lg">
          Continue
          {/* <FormattedMessage id="register.create.button.next" /> */}
        </Button>
      </Form>
    </div>
  );
});

export const GenerateMnemonicModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
}> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
  // const intl = useIntl();
  const words = newMnemonicConfig.mnemonic.split(" ");
  useEffect(() => {
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
  }, []);

  const { analyticsStore } = useStore();

  const { handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: newMnemonicConfig.name,
      words: newMnemonicConfig.mnemonic,
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div style={{ width: "100%" }}>
      {/* <Alert color="warning">
        <h3 style={{ color: "white" }}>
          <FormattedMessage id="register.create.warning.keep-your-mnemonic.header" />
        </h3>
        <ul>
          <li>
            <FormattedMessage id="register.create.warning.keep-your-mnemonic.paragraph1" />
          </li>
          <li>
            <FormattedMessage id="register.create.warning.keep-your-mnemonic.paragraph2" />
          </li>
        </ul>
      </Alert> */}
      {/* <div className={style.title}>
        {intl.formatMessage({
          id: "register.create.title",
        })}
        <div style={{ float: "right" }}>
          <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
            <Button
              type="button"
              color="primary"
              outline={newMnemonicConfig.numWords !== NumWords.WORDS12}
              onClick={() => {
                newMnemonicConfig.setNumWords(NumWords.WORDS12);
              }}
            >
              <FormattedMessage id="register.create.toggle.word12" />
            </Button>
            <Button
              type="button"
              color="primary"
              outline={newMnemonicConfig.numWords !== NumWords.WORDS24}
              onClick={() => {
                newMnemonicConfig.setNumWords(NumWords.WORDS24);
              }}
            >
              <FormattedMessage id="register.create.toggle.word24" />
            </Button>
          </ButtonGroup>
        </div>
      </div> */}
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          newMnemonicConfig.setName(data.name);
          newMnemonicConfig.setPassword(data.password);

          newMnemonicConfig.setMode("verify");
        })}
      >
        <BackButton
          onClick={() => {
            newMnemonicConfig.setMode("password");
          }}
        />
        <div className={style.passwordTitle}>Save your recovery phrase</div>
        <div className={style.newMnemonic}>
          <div className={style.gridContainer}>
            {words.map((word, idx) => {
              return (
                <div key={idx} className={style.word}>
                  <div style={{ color: "#959595", width: "21px" }}>{`${
                    idx + 1
                  }.`}</div>
                  <div style={{ color: "#E9E4DF" }}>{word}</div>
                </div>
              );
            })}
          </div>
          <div className={style.btnGroup}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                navigator.clipboard.writeText(newMnemonicConfig.mnemonic);
              }}
            >
              <img
                style={{ width: "14.4px", height: "16px" }}
                src={require("../../../public/assets/img/copy.svg")}
              />
              <div style={{ marginLeft: "7px" }}>Copy</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                const link = document.createElement("a");

                // Create a blog object with the file content which you want to add to the file
                const file = new Blob([newMnemonicConfig.mnemonic], {
                  type: "text/plain",
                });

                // Add file content in the object URL
                link.href = URL.createObjectURL(file);

                // Add file name
                link.download = "key.txt";

                // Add click event to <a> tag to save file.
                link.click();
                URL.revokeObjectURL(link.href);
              }}
            >
              <img
                style={{ width: "14.4px", height: "16px" }}
                src={require("../../../public/assets/img/download.svg")}
              />
              <div style={{ marginLeft: "7px" }}>Download</div>
            </div>
          </div>
        </div>
        {/* <Input
          label={intl.formatMessage({
            id: "register.name",
          })}
          type="text"
          name="name"
          ref={register({
            required: intl.formatMessage({
              id: "register.name.error.required",
            }),
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === "create" ? (
          <React.Fragment>
            <PasswordInput
              label={intl.formatMessage({
                id: "register.create.input.password",
              })}
              name="password"
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
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              label={intl.formatMessage({
                id: "register.create.input.confirm-password",
              })}
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: "register.create.input.confirm-password.error.required",
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()["password"]) {
                    return intl.formatMessage({
                      id:
                        "register.create.input.confirm-password.error.unmatched",
                    });
                  }
                },
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        <AdvancedBIP44Option bip44Option={bip44Option} /> */}
        <Button
          className={style.nextBtn}
          type="submit"
          block
          size="lg"
          onClick={async (e) => {
            e.preventDefault();

            try {
              await registerConfig.createMnemonic(
                newMnemonicConfig.name,
                newMnemonicConfig.mnemonic,
                newMnemonicConfig.password,
                bip44Option.bip44HDPath
              );
              analyticsStore.setUserProperties({
                registerType: "seed",
                accountType: "mnemonic",
              });
            } catch (e) {
              alert(e.message ? e.message : e.toString());
              registerConfig.clear();
            }
          }}
          data-loading={registerConfig.isLoading}
        >
          Create my wallet
        </Button>
        {/* <Button className={style.nextBtn} type="submit" block size="lg">
          Create my wallet
        </Button> */}
      </Form>
    </div>
  );
});

export const VerifyMnemonicModePage: FunctionComponent<{
  registerConfig: RegisterConfig;
  newMnemonicConfig: NewMnemonicConfig;
  bip44Option: BIP44Option;
}> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
  const wordsSlice = useMemo(() => {
    const words = newMnemonicConfig.mnemonic.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    return words;
  }, [newMnemonicConfig.mnemonic]);

  const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

  useEffect(() => {
    // Set randomized words.
    const words = newMnemonicConfig.mnemonic.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].trim();
    }
    words.sort((word1, word2) => {
      // Sort alpahbetically.
      return word1 > word2 ? 1 : -1;
    });
    setRandomizedWords(words);
    // Clear suggested words.
    setSuggestedWords([]);
  }, [newMnemonicConfig.mnemonic]);

  const { analyticsStore } = useStore();

  return (
    <div>
      <div style={{ minHeight: "153px" }}>
        <div className={style.buttons}>
          {suggestedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
                onClick={() => {
                  const word = suggestedWords[i];
                  setSuggestedWords(
                    suggestedWords
                      .slice(0, i)
                      .concat(suggestedWords.slice(i + 1))
                  );
                  randomizedWords.push(word);
                  setRandomizedWords(randomizedWords.slice());
                }}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
      <hr />
      <div style={{ minHeight: "153px" }}>
        <div className={style.buttons}>
          {randomizedWords.map((word, i) => {
            return (
              <Button
                key={word + i.toString()}
                onClick={() => {
                  const word = randomizedWords[i];
                  setRandomizedWords(
                    randomizedWords
                      .slice(0, i)
                      .concat(randomizedWords.slice(i + 1))
                  );
                  suggestedWords.push(word);
                  setSuggestedWords(suggestedWords.slice());
                }}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>
      <Button
        color="primary"
        type="submit"
        disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
        block
        size="lg"
        style={{
          marginTop: "30px",
        }}
        onClick={async (e) => {
          e.preventDefault();

          try {
            await registerConfig.createMnemonic(
              newMnemonicConfig.name,
              newMnemonicConfig.mnemonic,
              newMnemonicConfig.password,
              bip44Option.bip44HDPath
            );
            analyticsStore.setUserProperties({
              registerType: "seed",
              accountType: "mnemonic",
            });
          } catch (e) {
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        }}
        data-loading={registerConfig.isLoading}
      >
        <FormattedMessage id="register.verify.button.register" />
      </Button>
      <BackButton
        onClick={() => {
          newMnemonicConfig.setMode("generate");
        }}
      />
    </div>
  );
});
