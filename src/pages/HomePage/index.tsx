import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth0 } from 'react-auth0-spa';

export type Props = {};

// const Logout = () => {
//     const { logout } = useAuth0();

//     useEffect(() => {
//         logout();
//     }, []);

//     return <div />;
// }

const HomePage = (p: Props): JSX.Element => {
    useEffect(() => {
        window.location.href = process.env.REACT_APP_REDIRECT_HOMEPAGE || '/login';
    }, []);
    
    return (
        <div />
    );
};

export default HomePage;
