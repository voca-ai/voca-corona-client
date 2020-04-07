import React from 'react';
import { Redirect } from 'react-router-dom';
import { Routes } from 'routes';

export type Props = {};
const LoginCallbackPage = (p: Props): JSX.Element => {
    return <Redirect to={Routes.TermsPage} />;
};

export default LoginCallbackPage;
