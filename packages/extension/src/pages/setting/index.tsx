import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../layouts";
import { useHistory } from "react-router";
// import { PageButton } from "./page-button";
import style from "./style.module.scss";
// import { useLanguage } from "../../languages";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FormattedMessage } from "react-intl";

export const SettingPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  console.log(keyRingStore);

  // const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  // const paragraphLang = language.automatic
  //   ? intl.formatMessage(
  //       {
  //         id: "setting.language.automatic-with-language",
  //       },
  //       {
  //         language: intl.formatMessage({
  //           id: `setting.language.${language.language}`,
  //         }),
  //       }
  //     )
  //   : intl.formatMessage({
  //       id: `setting.language.${language.language}`,
  //     });

  // const paragraphFiat = !language.isFiatCurrencyAutomatic
  //   ? language.fiatCurrency.toUpperCase()
  //   : intl.formatMessage(
  //       {
  //         id: "setting.fiat.automatic-with-fiat",
  //       },
  //       {
  //         fiat: language.fiatCurrency.toUpperCase(),
  //       }
  //     );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.settings",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <div className={style.settingBox}>
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            Change password
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div
          className={style.settingBox}
          onClick={() => {
            history.push({
              pathname: "/setting/autolock",
            });
          }}
        >
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            Auto-Lock Timer
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
      </div>
      <div className={style.container}>
        <div className={style.settingBox}>
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            Export Private Key
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={style.settingBox}>
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            Show Secret Recovery Phrase
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
      </div>
      <div className={style.container}>
        <div
          className={style.settingBox}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            history.push(`/setting/clear/0`);
          }}
        >
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            <FormattedMessage id="setting.clear" />
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
        <div style={{ background: "#333333", height: "1px" }} />
        <div className={style.settingBox}>
          <div
            style={{
              color: "#E9E4DF",
            }}
          >
            Reset Secret Recovery Phrase
          </div>
          <i className="fas fa-chevron-right" style={{ color: "#696969" }} />
        </div>
      </div>
      {/* <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language",
          })}
          paragraph={paragraphLang}
          onClick={() => {
            history.push({
              pathname: "/setting/language",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.fiat",
          })}
          paragraph={paragraphFiat}
          onClick={() => {
            history.push({
              pathname: "/setting/fiat",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.connections",
          })}
          paragraph={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/connections",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.export-to-mobile",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/export-to-mobile",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.autolock",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/autolock",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title="Show Advanced IBC Transfers"
          onClick={() => {
            uiConfigStore.setShowAdvancedIBCTransfer(
              !uiConfigStore.showAdvancedIBCTransfer
            );
          }}
          icons={[
            <label
              key="toggle"
              className="custom-toggle"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={uiConfigStore.showAdvancedIBCTransfer}
                onChange={() => {
                  uiConfigStore.setShowAdvancedIBCTransfer(
                    !uiConfigStore.showAdvancedIBCTransfer
                  );
                }}
              />
              <span className="custom-toggle-slider rounded-circle" />
            </label>,
          ]}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.endpoints",
          })}
          paragraph={intl.formatMessage({
            id: "setting.endpoints.paragraph",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/endpoints",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.credit",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/credit",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
      </div> */}
    </HeaderLayout>
  );
});
