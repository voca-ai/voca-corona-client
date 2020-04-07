import React from 'react';
import styled from 'styled-components';
import { linkStyle, LinkStyleProps } from './TextLink';

export type Props = React.HTMLProps<HTMLAnchorElement> & LinkStyleProps;
const CustomButton = ({ children, ...rest }: Props) => <a {...rest}>{children}</a>;
const TextButton = styled(CustomButton)`
    ${linkStyle}
`;
export default TextButton;
