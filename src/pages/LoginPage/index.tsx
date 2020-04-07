import React, { useEffect } from 'react';

import { Routes } from 'routes';
import styles from './index.module.scss';
import TextLink from 'ui/TextLink';
import { useAuth0 } from 'react-auth0-spa';
import { appLogo, vocaLogo } from 'assets';
import ReactMarkdown from 'react-markdown';
import Button from 'ui/Button';

const Logout = () => {
    const { logout } = useAuth0();

    useEffect(() => {
        logout();
    }, []);

    return <div />;
}

export type Props = {};

const introText = `**We need your help to beat COVID-19.**  
We would be very grateful if you are willing to log in and complete this questionnaire daily.
This will enable researchers to understand trends prior to symptoms, which is critical in fighting COVID-19.`

const LoginPage = (p: Props): JSX.Element => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    const login = async (loginOptions?: RedirectLoginOptions) => {
        await loginWithRedirect(loginOptions);
    };

    return (
        isAuthenticated ?
            <Logout /> :
            <div className={styles.container}>
                <div className={styles.content}>
                    <a href="https://voca.ai" target="_blank" rel="noopener noreferrer" className={styles.vocaLogo}>
                        <img src={vocaLogo} alt="Voca.ai" />
                    </a>
                    <img className={styles.appLogo} src={appLogo} alt="Corona Voice Detect" />

                    <ReactMarkdown source={introText} className={styles.text} />

                    <div className={styles.links}>
                        <Button onClick={() => login()} className={styles.signUp}>
                            Sign up / Sign in
                        </Button>
                        <TextLink to={Routes.LoginCallbackPage} className={styles.skip}>Skip</TextLink>
                    </div>
                </div>
        </div>
    );
};

export default LoginPage;
