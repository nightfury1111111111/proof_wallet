import React, { forwardRef, useState } from "react";

import classnames from "classnames";

import {
  // FormFeedback,
  FormGroup,
  FormText,
  InputGroup,
  Input as ReactStrapInput,
  Label,
} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

import styleInput from "./input.module.scss";

import { Buffer } from "buffer/";

export interface InputProps {
  type?: Exclude<InputType, "textarea">;
  label?: string;
  text?: string | React.ReactElement;
  error?: string;

  prepend?: React.ReactElement;
  append?: React.ReactElement;

  formGroupClassName?: string;
  inputGroupClassName?: string;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<
  HTMLInputElement,
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const {
    className,
    formGroupClassName,
    inputGroupClassName,
    type,
    label,
    text,
    error,
    prepend,
    append,

    // XXX: It's been so long I can't remember why I did this...
    color: _color,
    children: _children,
    ...attributes
  } = props;

  const [focused, setFocused] = useState(false);

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup className={formGroupClassName}>
      {label ? (
        <Label
          for={inputId}
          className="form-control-label"
          style={{ color: "white" }}
        >
          {label}
        </Label>
      ) : null}
      <InputGroup className={inputGroupClassName}>
        {prepend}
        {/* <div className={styleInput.inputWrapper}> */}
        <div
          className={styleInput.inputWrapper}
          style={
            focused
              ? type !== "password"
                ? {
                    border: "4px solid rgba(255, 212, 138, 0.3)",
                    marginTop: "-4px",
                  }
                : {}
              : {}
          }
        >
          <ReactStrapInput
            id={inputId}
            className={classnames(
              "form-control-alternative",
              className,
              styleInput.input
            )}
            type={type}
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
            innerRef={ref}
            {...attributes}
          />
        </div>
        {append}
      </InputGroup>
      {/* {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : text ? (
        <FormText>{text}</FormText>
      ) : null} */}
      {error ? (
        <div
          style={{
            width: "100%",
            marginTop: "0.4rem",
            fontSize: "100%",
            color: "#E54D4D",
          }}
        >
          {error}
        </div>
      ) : text ? (
        <FormText>{text}</FormText>
      ) : null}
    </FormGroup>
  );
});
