import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';
import { Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Routes } from 'routes';
import { useGlobalStore } from 'store';
import Button from 'ui/Button';

const terms = `
# Consent Form

## CONCISE SUMMARY
The purpose of this venture is to collect data that is useful for diagnosis of COVID-19 patients based on voice analysis. If successful, we hope to use voice samples as a new screening method for early detection of COVID-19 infection. However, at this stage, we are simply collecting information to be made available for the research community and advance rapid new techniques for COVID-19 detection.
You will be shown a short questionnaire to collect demographic information, as well as an indication whether or not you have been tested positive for COVID-19. You will be asked to provide a voice sample. We may request that you log-on using your GOOGLE™ account, to enable provisioning of multiple samples over time. 
If you are interested in learning more about this study, please continue to read below.

## INTRODUCTION
Thank you for deciding to volunteer in our research project. We aim to study the ability of Deep Learning techniques and voice analysis to assist in diagnosis of COVID-19, and assist in stopping the pandemic. The research project will consist of you filling a short questionnaire and obtaining a recordation of your voice. All your data collected will be anonymized.
Please note that you have no obligation to participate and you may decide to terminate your participation at any time. Below is a description of the research project, and your consent to participate. Please read this information carefully. 
By clicking the button, you are agreeing that you’ve had time to read and consider this consent waiver and are comfortable with what is being asked of you as a participant. 

## TITLE OF RESEARCH PROJECT
Corona Voice Detect

## BENEFITS AND RISKS
We hope to be able to assist in early and remote diagnosis of COVID-19 patients, to target suspected cases for expensive laboratory tests. 
We have not identified any particular risk associated with your participation in this venture. 
   
## CONFIDENTIALITY
We will keep your information confidential and will not divulge any non-anonymized data. Anonymized dataset may be transferred to third parties. In particular, anonymized data may be transferred to third parties for COVID-19 related research purposes. 
If you log-in using your GOOGLE™ identifier, we will not collect any information from your GOOGLE™ account other than your identifier. The identifier will be retained in a hashed manner, preventing us from being able to reconstruct your identifier, and being useful for the sole purpose of determining if a new identifier is identical to a previously retained one. 

## RESEARCH DATA & FEEDBACK
You give your permission to Voca.ai to collect information about your participation in the research project in the formats and medium (“Data”) described above. We shall own and control all Data in connection with the research project. You may also provide suggestions, comments or other feedback (“Feedback”) to the investigators with respect to the research project. Feedback is entirely voluntary and the research team shall be free to use, disclose, license, or otherwise distribute, and exploit the Feedback and Data as authorized by the research participant. 

## YOUR AUTHORITY TO PARTICIPATE
You represent that you have the full right and authority to sign this form.
By clicking the survey button, you confirm that you understand what the project is about and how and why it is being done. Should you have any questions concerning this project, please contact the supervising researchers: 
 - Voca.ai
 - Shmuel Ur at shmuel.ur@gmail.com

Please print this page for your records.

We thank you for your participation.
`;


export type Props = {};


const TermsPage = (p: Props): JSX.Element => {
    const globalStore = useGlobalStore()
    const [agreeChecked, setAgreeChecked] = useState(false);
    const history = useHistory();

    const proceed = useCallback(
        () => {
            history.replace(Routes.RecorderDetailsPage);
        },
        [history],
    );

    useEffect(() => {
        if (globalStore.agreeTerms) {
            proceed();
        }
    }, [globalStore, proceed]);

    return (
        <div className={styles.container}>
            <Form className={styles.content}>
                {/* <div className={styles.terms}>{terms}</div> */}
                <ReactMarkdown source={terms} className={styles.terms} />
                <Form.Group controlId="agreeCheckbox" className={styles.checkbox}>
                    <Form.Check
                        type="checkbox"
                        onChange={() => setAgreeChecked(!agreeChecked)} checked={agreeChecked}
                        label="Agree to terms and conditions"
                    />
                </Form.Group>
                <Button
                    type="submit"
                    disabled={!agreeChecked}
                    className={styles.proceedButton}
                    onClick={() => {
                        if (agreeChecked) {
                            globalStore.agreeTerms = true;
                            proceed();
                        }
                    }}
                >
                    Proceed
                </Button>
            </Form>
        </div>
    );
};

export default TermsPage;
