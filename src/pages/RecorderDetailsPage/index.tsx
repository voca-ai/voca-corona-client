import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Routes } from 'routes';
import ReactJsonSchemaForm from 'react-jsonschema-form';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useGlobalStore } from 'store';
import { createSubmission } from 'utils/api';
import { useAuth0 } from 'react-auth0-spa';
import { schema, uiSchema, formRevision } from '../../schema';
import { DegreesField } from './fields/degrees';
import { HeightField } from './fields/height';

const fields = {
    degrees: DegreesField,
    height: HeightField,
};

const lastFillKey = 'lastFill';
const lastFillFormRevision = 'lastFillFormRevision';

export type Props = {};

const RecorderDetailsPage = observer((p: Props): JSX.Element => {
    const { user } = useAuth0();
    const store = useGlobalStore();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(null);

    const onSubmit = async (submission: any) => {
        setSubmitting(true);

        const { formData } = submission;
        localStorage.setItem(lastFillKey, JSON.stringify(formData));
        localStorage.setItem(lastFillFormRevision, JSON.stringify(formRevision));

        const { email } = user || {};
        const formSubmissionId = await createSubmission({
            user: { email },
            formRevision,
            formData,
        });

        console.log('formSubmissionId', formSubmissionId);
        if (formSubmissionId) {
            store.formSubmissionId = formSubmissionId;

            history.push(Routes.RecordPage);
        } else {
            alert("An error has occured");
        }
        setSubmitting(false);
    };

    const onError = (...p: any) => {
        console.log('onError', p);
    };

    useEffect(() => {
        const savedFormReivision = JSON.parse(localStorage.getItem(lastFillFormRevision) || '0');

        if (savedFormReivision < formRevision) {
            localStorage.removeItem(lastFillKey);
        } else {
            const savedFormDataStr = localStorage.getItem(lastFillKey);

            if (savedFormDataStr) {
                try {
                    const savedFormData = JSON.parse(savedFormDataStr);
                    setFormData(savedFormData);
                } catch(e) {
                    localStorage.removeItem(lastFillKey)
                }
            }
        }

        setLoading(false);
    }, []);


    return (
        loading ? <div /> :
        <div className={styles.container}>
            <div className={styles.content}>
                <ReactJsonSchemaForm
                    schema={schema}
                    uiSchema={uiSchema}
                    onSubmit={onSubmit}
                    onError={onError}
                    fields={fields}
                    formData={formData}
                >
                    <div>
                        <button disabled={submitting} type="submit" className={styles.submitButton}>Submit</button>
                    </div>
                </ReactJsonSchemaForm>
            </div>
        </div>
    );
});

export default RecorderDetailsPage;
