import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../../layouts";

import styleLanguage from "./language.module.scss";
import { useLanguage } from "../../../languages";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";

export const SettingLanguagePage: FunctionComponent = () => {
  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  // const selectedIcon = useMemo(
  //   () => [<i key="selected" className="fas fa-check" />],
  //   []
  // );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.language",
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={styleLanguage.container}>
        {/* <PageButton
          title={intl.formatMessage({
            id: "setting.language.automatic",
          })}
          onClick={useCallback(() => {
            language.clearLanguage();
            history.push({
              pathname: "/",
            });
          }, [history, language])}
          icons={language.automatic ? selectedIcon : undefined}
        /> */}
        <div
          className={styleLanguage.languageBox}
          onClick={useCallback(() => {
            language.setLanguage("en");
          }, [language])}
        >
          <div
            style={{
              color:
                language.automatic || language.language == "en"
                  ? "#E9E4DF"
                  : "#959595",
            }}
          >
            {intl.formatMessage({
              id: "setting.language.en",
            })}
          </div>
          {(language.automatic || language.language == "en") && (
            <div className={styleLanguage.icon}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "25px",
                  height: "25px",
                  borderRadius: "30px",
                  background: "#7eff9b",
                  opacity: 0.15,
                }}
              />
              <i
                key="selected"
                className="fas fa-check"
                style={{ color: "#7EFF9B", scale: 0.6 }}
              />
            </div>
          )}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            Deutsch
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            Español
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            Français
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            中文
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            日本語
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            Русский
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={styleLanguage.languageBox}>
          <div
            style={{
              color: language.language == "ko" ? "#E9E4DF" : "#959595",
            }}
          >
            Português
          </div>
          {language.automatic ||
            (language.language == "ko" && (
              <div className={styleLanguage.icon}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30px",
                    background: "#7eff9b",
                    opacity: 0.15,
                  }}
                />
                <div style={{ scale: 0.6 }}>
                  <i
                    key="selected"
                    className="fas fa-check"
                    style={{ color: "#7EFF9B" }}
                  />
                </div>
              </div>
            ))}
        </div>
        {/* <PageButton
          title={intl.formatMessage({
            id: "setting.language.en",
          })}
          onClick={useCallback(() => {
            language.setLanguage("en");
            history.push({
              pathname: "/",
            });
          }, [history, language])}
          icons={
            language.automatic || language.language == "en"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.ko",
          })}
          onClick={useCallback(() => {
            language.setLanguage("ko");
            history.push({
              pathname: "/",
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "ko"
              ? selectedIcon
              : undefined
          }
        /> */}
      </div>
    </HeaderLayout>
  );
};
