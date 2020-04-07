import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';

export type LinkStyleProps = { underline?: boolean };
export const linkStyle = css`
    &, &:not([href]) {
        color: #041f3a;
        transition: color .4s ease;
        display: inline-block;
        text-transform: uppercase;
        ${(props: LinkStyleProps) => props.underline !== false && 'text-decoration: underline'};
        cursor: pointer;

        &:hover {
            border-color: #24b7e0;
            color: #24b7e0;
            text-decoration: underline;
        }
    }
`;

export type Props = LinkProps & LinkStyleProps;
const CustomLink = (p: Props) => <Link {...p} />;
const TextLink = styled(CustomLink)`
    ${linkStyle}
`;
export default TextLink;
