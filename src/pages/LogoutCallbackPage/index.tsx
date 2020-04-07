import React from 'react';
import { Redirect } from 'react-router-dom';
import { Routes } from 'routes';

export type Props = {};
const LogoutCallbackPage = (p: Props): JSX.Element => {
    return <Redirect to={Routes.LoginPage} />;
};

export default LogoutCallbackPage;
