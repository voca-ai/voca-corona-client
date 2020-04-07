import React from 'react';
import { isAudioSupported } from 'utils/audioRecording';
import facebookMenuIcon from 'assets/facebook-menu.png';

import styles from './index.module.scss';
import CopyUrlField from 'ui/CopyUrlField';
import classNames from 'classnames';

// https://stackoverflow.com/a/32348687/2640153
function isFacebookApp(): boolean {
    var ua: string = navigator.userAgent || navigator.vendor || (window as any).opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}

export type Props = { children: any };
const EnforceAudioSupport = (p: Props) => {
    let error = null;

    const isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    const isAndroid = /(android)/i.test(navigator.userAgent);
        
    if (isFacebookApp()) {
        const isFacebookLite = isAndroid && /FBLC/i.test(navigator.userAgent);

        error = (
            <div className={styles.facebookMessage}>
                Facebook's browser is not supported. <br /><br />
                {
                    isIOS || isAndroid ?
                        <>
                            <ol>
                                <li>
                                    Click on the menu icon:
                                    <div className={classNames(styles.facebookMenuIcon, isFacebookLite && styles.facebookLiteMenuIcon)}>
                                        <img
                                            alt="Menu icon" 
                                            src={facebookMenuIcon}
                                        />
                                    </div>
                                </li>
                                <li>
                                    Choose "Open in {isIOS ? 'Safari' : 'Chrome'}"
                                </li>
                            </ol>
                            <i className={styles.arrow} />
                        </> :
                        <>
                            Please click below to copy the URL. After you do, open it using your default browser:
                            <CopyUrlField />
                        </>
                }
            </div>
        );
    } else if (!isAudioSupported()) {
        error = (
            isIOS ?
            <>
                Audio recording in iOS is supported only via Safari browser. <br /><br />
                Please click below to copy the URL. After you do, please open it using Safari.
                <CopyUrlField />
            </> :
            <>
                Audio recording not supported!
            </>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    {error} 
                </div>
            </div>
        );
    }
        
    return p.children;
}
export default EnforceAudioSupport;
        