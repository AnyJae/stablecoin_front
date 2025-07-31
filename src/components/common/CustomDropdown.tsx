"use client";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import styled, { css } from "styled-components";

interface CustomDropdownProps {
  _onChange: (selectedOption: any) => void;
  _options: (string)[];
  _defaultOption: number;
  _placeholder?: string;
  _border?: string;
  _width?: number | string;
  _fontSize?: number;
}

export function CustomDropdown({
  _onChange,
  _options,
  _defaultOption = 0,
  _placeholder = "Select an option",
  _border = "none",
  _width = "auto",
  _fontSize = 14,
}: CustomDropdownProps) {
  return (
    <StyledDropdown
      options={_options}
      onChange={_onChange}
      value={_options[_defaultOption].toString()}
      placeholder={_placeholder}
      $border={_border}
      $width={_width}
      $fontSize={_fontSize}
    />
  );
}

const StyledDropdown = styled(Dropdown)<{ $border: string; $width: number|string; $fontSize: number }>`
  .Dropdown-control {
    background-color: transparent;
    color: white;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    justify-content: center;
    ${(props) => {
      if (!props.$border) return;

      switch (props.$border) {
        case "solid":
          return css`
            border: 1px solid #B3B3B3;
          `;
        case "solid-round":
          return css`
            border: 1px solid #B3B3B3;
            border-radius: 6px;
          `
        case "dashed":
          return css`
            border: 5px dashed #B3B3B3;
          `;
        case "none":
          return css`
            border: none;
          `;
        default: // 다른 값이 오면 해당 값을 색상으로 사용
          return css`
            border: 1px solid ${props.$border};
          `;
      }
    }}
   width: ${(props) =>
  typeof props.$width === "number" ? `${props.$width}px` : props.$width};
    font-size: ${(props) => props.$fontSize}px;
  }

  .Dropdown-placeholder {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .Dropdown-arrow-wrapper {
    margin-left: 10px;
    display: flex;
    align-items: center;
  }

  .Dropdown-menu {
    background-color: #201e21;
    border-radius: 5px;
    border-color: #B3B3B3;
    width: ${(props) => props.$width}px;
  }

  .Dropdown-option {
    display: flex;
    justify-content: center;
    color: white;
    font-size:  ${(props) => props.$fontSize}px;
    &:hover {
      background-color: transparent;
      color: #1bdebe;
    }

  }

  .Dropdown-option.is-selected {
    color: #1bdebe;
    font-size:  ${(props) => props.$fontSize}px;
    background-color: transparent;
  }
`;
