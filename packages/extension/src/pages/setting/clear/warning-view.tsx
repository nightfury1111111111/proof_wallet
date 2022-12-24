import React, { FunctionComponent } from "react";

import styleWarningView from "./warning-view.module.scss";
// import { Alert, Button } from "reactstrap";
// import { useHistory } from "react-router";
// import { FormattedMessage } from "react-intl";

import { MultiKeyStoreInfoWithSelectedElem } from "@proof-wallet/background";

export const WarningView: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({}) => {
  // const history = useHistory();

  // const onBackUpMnemonicButtonClick = useCallback(
  //   (e: MouseEvent) => {
  //     e.preventDefault();

  //     history.push(`/setting/export/${index}`);
  //   },
  //   [history, index]
  // );

  return (
    <div className={styleWarningView.innerContainer}>
      {/* {keyStore.type === "mnemonic" ? (
        <Alert color="warning" fade={false}>
          <div>
            <FormattedMessage id="setting.clear.alert" />
          </div>
          <Button
            size="sm"
            style={{ float: "right", marginTop: "10px" }}
            color="white"
            outline
            onClick={onBackUpMnemonicButtonClick}
          >
            <FormattedMessage id="setting.clear.button.back-up" />
          </Button>
        </Alert>
      ) : null} */}
      <div className={styleWarningView.trashContainer}>
        <img
          src={'https://proofwalletsvgs.s3.amazonaws.com/error'}
          alt="trash-can"
        />
        <div>Remove Wallet</div>
      </div>
    </div>
  );
};
