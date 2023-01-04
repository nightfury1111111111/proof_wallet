import React from "react";

import styleWarningView from "./warning-view.module.scss";

export const WarningView = () => {
  return (
    <div className={styleWarningView.innerContainer}>
      <div className={styleWarningView.trashContainer}>
        <img
          src={"https://proofwalletsvgs.s3.amazonaws.com/error"}
          alt="trash-can"
        />
        <div>Reset Seed Phrase</div>
      </div>
    </div>
  );
};
