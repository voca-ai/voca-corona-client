import React from 'react';
import {Link, LinkProps} from 'react-router-dom';
import styled from 'styled-components';
import { buttonStyle, ButtonStyleProps } from './Button';

export type Props = LinkProps & ButtonStyleProps;

const CustomLink = (p: Props) => {
    const { secondary, disabled, to, ...rest } = p;

    return (
        <Link
            to={to || '#'}
            onClick={e => {
                if (!to) {
                    e.preventDefault();
                }
                p.onClick && p.onClick(e);
            }}
            {...rest}
        />
    );
};

const ButtonLink = styled(CustomLink)`
    ${buttonStyle}
`;
export default ButtonLink;
