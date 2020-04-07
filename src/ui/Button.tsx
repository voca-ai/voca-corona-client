import React from 'react';
import styled, { css } from 'styled-components';

export type ButtonStyleProps = { secondary?: boolean, disabled?: boolean, to?: string }
export const buttonStyle = css<ButtonStyleProps>`
    border: 0;
    border-radius: 28px;
    box-shadow: none;
    cursor: pointer;
    display: inline-block;
    font-size: 18px;
    text-align: center;
    text-decoration: none;
    overflow-wrap: break-word;

    background: linear-gradient(to right,#1b87dd 34%,#19a3df 100%);
    color: #fff;
    text-transform: uppercase;

    ${(props: Props) => props.secondary ? `
        border: 2px solid;
        color: rgb(36, 183, 224);
        background: transparent;
        padding: 18px 44px;
    ` : `
        padding: 20px 46px;
    `}

    ${(props: Props) => props.disabled && `
        filter: grayscale(100%);
        pointer-events: none;
        cursor: not-allowed;
    `}

    &:hover {
        color: #fff;
        background: #041f3a;
        border-color: transparent;
    }
`;

export type Props = React.HTMLProps<HTMLButtonElement> & ButtonStyleProps;
const Button = styled('button')`
    ${buttonStyle}
`;
export default Button;
