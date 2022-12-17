import React, { FunctionComponent } from "react";

import classnames from "classnames";

import stylePageButton from "./page-button.module.scss";

export const PageButton: FunctionComponent<
  {
    avatarColor?: string;
    avatarName?: string;
    pinned?: boolean;
    title: string;
    paragraph?: string;
    subParagraph?: string;
    icons?: React.ReactElement[];
  } & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const {
    avatarColor,
    avatarName,
    pinned,
    title,
    paragraph,
    subParagraph,
    icons,
  } = props;

  const attributes = { ...props };
  delete attributes.paragraph;
  delete attributes.subParagraph;
  delete attributes.icons;

  return (
    <div
      className={classnames(stylePageButton.container, {
        [stylePageButton.withSubParagraph]: subParagraph != null,
      })}
      {...attributes}
    >
      {avatarColor && (
        <div
          className={stylePageButton.avatar}
          style={{ background: avatarColor }}
        >
          {avatarName?.toUpperCase()}
        </div>
      )}
      <div className={stylePageButton.innerContainer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {pinned && (
            <img
              style={{ width: "9.05px", height: "12.47px", marginRight: "7px" }}
              src={require("../../public/assets/img/pin.svg")}
            />
          )}
          <h1>{title}</h1>
        </div>
        {paragraph ? <p>{paragraph}</p> : null}
        {subParagraph ? <p>{subParagraph}</p> : null}
      </div>
      <div style={{ flex: 1 }} />
      {icons
        ? icons.map((icon, i) => {
            return (
              <div className={stylePageButton.iconContainer} key={i.toString()}>
                <div style={{ flex: 1 }} />
                {icon}
                <div style={{ flex: 1 }} />
              </div>
            );
          })
        : null}
    </div>
  );
};
