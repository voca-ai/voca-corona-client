import React, { useState, useRef, useCallback } from 'react';
import { Button, FormControl, InputGroup, Overlay } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import copy from 'copy-to-clipboard';
import styles from './index.module.scss';

const CopyUrlField = () => {
    const [showOverlay, setShowOverlay] = useState(false);
    const overlayTarget = useRef<any>(null);
    const timeoutHandle = useRef<number | undefined>(undefined);

    const url = window.location.href;
    const copyUrl = useCallback(() => {
        copy(url);
        setShowOverlay(true);

        if (timeoutHandle.current) {
            window.clearTimeout(timeoutHandle.current);
        }
        timeoutHandle.current = window.setTimeout(() => {
            setShowOverlay(false);
        }, 1500);
    }, [url, setShowOverlay]);

    return (
        <>
            <InputGroup className={styles.copyGroup} ref={overlayTarget} onClick={copyUrl}>
                <FormControl value={url} readOnly />
                <InputGroup.Append>
                    <Button variant="outline-secondary">
                        <FontAwesomeIcon icon={faCopy} />
                    </Button>
                </InputGroup.Append>
            </InputGroup>
            <Overlay target={overlayTarget.current} show={showOverlay} placement="top">
                {({
                    placement,
                    scheduleUpdate,
                    arrowProps,
                    outOfBoundaries,
                    show: _show,
                    ...props
                }: any) => (
                        <div
                            {...props}
                            className={styles.copyOverlay}
                        >
                            URL Copied!
                        </div>
                    )}
            </Overlay>
        </>
    );
}
export default CopyUrlField;
