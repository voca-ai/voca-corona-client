import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { record, Recording } from 'utils/audioRecording';
import { observable, computed } from 'mobx';
import { useLocalStore, observer } from 'mobx-react';
import classNames from 'classnames';
import { uploadRecording, backgroudnUploader, submitFeedback } from 'utils/api';
import { useGlobalStore } from 'store';
import { useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Routes } from 'routes';
import EnforceAudioSupport from 'EnforceAudioSupport';
import Spinner from 'Spinner';
import { Form } from 'react-bootstrap';
import { tasksList, Task } from 'schema';
import Button from 'ui/Button';
import TextButton from 'ui/TextButton';

export type Props = {};

enum Phase {
    Recording,
    Verification,
};

const tasksMap: Map<string, Task> = (
    JSON.parse(process.env.REACT_APP_NO_TASKS || 'false') ?
        new Map() :
        new Map(tasksList)
);

class RecordStore {
    @observable activeRecording: Recording | null = null;
    tasks = tasksMap;
    @observable completedTaskKeys: { [key: string]: boolean } = {};
    @observable currentTaskKey: string | undefined = this.tasks.size ? [...this.tasks.keys()][0] : undefined;
    @observable loading: boolean = false;
    @observable currentPhase: Phase = Phase.Recording;
    @computed get done() {
        return this.currentTaskKey == null;
    };

    @computed get taskKeys(): string[] {
        const taskKeys = [...this.tasks.keys()];
        return taskKeys;
    }

    @computed get allCompleted(): boolean {
        const allDone = this.taskKeys.every(index => this.completedTaskKeys[index])
        return allDone;
    }

    @computed get nextTaskKey(): string | undefined {
        const nextSentenceKey = this.taskKeys.find(index => !this.completedTaskKeys[index])
        return nextSentenceKey;
    }

    @computed get numTasks(): number {
        return this.taskKeys.length;
    }

    @computed get numCompletedTasks(): number {
        const doneTaskIndexes = this.taskKeys.filter(index => this.completedTaskKeys[index]);
        return doneTaskIndexes.length;
    }

    @computed get currentTask(): Task | undefined {
        if (this.currentTaskKey != null) {
            const currentSentence = this.tasks.get(this.currentTaskKey);
            return currentSentence;
        } else {
            return undefined;
        }
    }

    selectTaskByKey = (taskKey: string | undefined) => {
        this.currentPhase = Phase.Recording;
        this.currentTaskKey = taskKey;
    }

    selectNextTask = () => {
        if (this.currentTaskKey != null) {
            this.completedTaskKeys[this.currentTaskKey] = true;
        }
        this.selectTaskByKey(this.nextTaskKey);
    }

    clear = () => {
        this.completedTaskKeys = {};
    }

    isCompleted = (sentenceKey: string) => {
        const completed = !!this.completedTaskKeys[sentenceKey];
        return completed;
    }

    @computed get currentTaskIndex() {
        const index = this.taskKeys.findIndex(n => n === this.currentTaskKey);
        return index;
    }

    set currentTaskIndex(value: number) {
        if (value >= 0 && value < this.tasks.size) {
            this.selectTaskByKey(this.taskKeys[value]);
        }
    }

    verifyClip = () => {
        this.currentPhase = Phase.Verification;
    }

    advanceToNextClip = () => {
        this.currentPhase = Phase.Recording;
        this.currentTaskIndex++;
    }

    advanceToEnd = () => {
        this.currentTaskKey = undefined;
        this.currentPhase = Phase.Recording;
    }

    redoRecording = () => {
        this.currentPhase = Phase.Recording;
    }
}

const micIcon = (
    <svg width="29" height="28" viewBox="0 0 29 28"><defs><path id="mic-path3" d="M9.333 18.667A4.68 4.68 0 0 0 14 14V4.667A4.68 4.68 0 0 0 9.333 0a4.68 4.68 0 0 0-4.666 4.667V14a4.68 4.68 0 0 0 4.666 4.667zM7 4.667a2.34 2.34 0 0 1 2.333-2.334 2.34 2.34 0 0 1 2.334 2.334V14a2.34 2.34 0 0 1-2.334 2.333A2.34 2.34 0 0 1 7 14V4.667zm11.667 7V14c0 4.783-3.617 8.633-8.167 9.217v2.45H14c.7 0 1.167.466 1.167 1.166S14.7 28 14 28H4.667c-.7 0-1.167-.467-1.167-1.167s.467-1.166 1.167-1.166h3.5v-2.45C3.617 22.633 0 18.667 0 14v-2.333c0-.7.467-1.167 1.167-1.167s1.166.467 1.166 1.167V14c0 3.85 3.15 7 7 7s7-3.15 7-7v-2.333c0-.7.467-1.167 1.167-1.167s1.167.467 1.167 1.167z"></path></defs><g fill="none" fillRule="evenodd" transform="translate(5)"><mask id="mic-mask3" fill="#fff"><use xlinkHref="#mic-path3"></use></mask><g fill="#FF4F5E" mask="url(#mic-mask3)"><path d="M-5 0h28v28H-5z"></path></g></g></svg>
);

const stopIcon = (
    <svg width="28" height="28" viewBox="0 0 28 28"><defs><path id="stop-path7" d="M19.833 0H3.5C1.517 0 0 1.517 0 3.5v16.333c0 1.984 1.517 3.5 3.5 3.5h16.333c1.984 0 3.5-1.516 3.5-3.5V3.5c0-1.983-1.516-3.5-3.5-3.5zM21 19.833c0 .7-.467 1.167-1.167 1.167H3.5c-.7 0-1.167-.467-1.167-1.167V3.5c0-.7.467-1.167 1.167-1.167h16.333c.7 0 1.167.467 1.167 1.167v16.333z"></path></defs><g fill="none" fillRule="evenodd" transform="translate(2.333 2.333)"><mask id="stop-mask7" fill="#fff"><use xlinkHref="#stop-path7"></use></mask><g fill="white" mask="url(#stop-mask7)"><path d="M-2.333-2.333h28v28h-28z"></path></g></g></svg>
);

const RecordButton = (p: any) => (
    <div className={styles.recordButton}>
        <button {...p}>
            {p.children}
        </button>
        <div className={styles.background} />
    </div>
);

const DoneMessage = () => {
    const globalStore = useGlobalStore();
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const onSubmit = async () => {
        try {
            setLoading(true);
            const { formSubmissionId } = globalStore;
            if (!formSubmissionId) {
                throw new Error('No submission id!');
            }
            await submitFeedback(formSubmissionId, feedback);
            setFeedbackSubmitted(true);
        } catch (e) {
            console.error(e);
            alert(`There was an error submitting the feedback!`)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.doneMessage}>
            <main>
                <h1>All done!</h1>

                <section x-name="thankyou">
                    Thank you for your participation! <br />
                    The data will be used anonymously for research purposes. <br /><br />
                    If you would like to help some more, please do another recording tomorrow.
                </section>

                {
                    feedbackSubmitted ?
                    <section x-name="feedbackSubmitted">
                        Thank you for your feedback! <br />
                        <TextButton onClick={() => setFeedbackSubmitted(false)}>Edit feedback</TextButton>
                    </section> :
                    <section x-name="feedback">
                        We'd appreaciate your feedback:

                        <Form.Control
                            as="textarea"
                            value={feedback}
                            onChange={event => setFeedback((event.target as HTMLTextAreaElement).value)}
                        />
                        <Button type="submit" disabled={loading || !feedback.length} onClick={onSubmit}>Submit</Button>
                    </section>
                }
            </main>

            <footer>
                Made with <span aria-label="love">❤</span> by&nbsp;<a href="https://voca.ai">Voca.ai</a>
            </footer>
        </div>
    )
};

type Actions = {
    startRecording: () => void,
    stopRecording: () => void,
    playRecording: () => void,
    redoRecording: () => void,
    nextTask: () => void,
    endSession: () => void,
};

const RecordingPhase = observer((p: {recordStore: RecordStore, actions: Actions}) => {
    const { actions, recordStore } = p;

    return (
        <div className={classNames(styles.recordingPhase, {
            [styles.loading]: recordStore.loading,
        })}>
        {
            recordStore.done ? (
                backgroudnUploader.remainingRequestsCount > 0 ? // Wait for all recordings to upload
                    <div className={styles.spinnerContainer}><Spinner /></div> :
                    <DoneMessage />
            ) : (
                    <>
                        <div className={styles.sentence}>
                            <h1>{recordStore.currentTask!.title}</h1>
                            {
                                recordStore.currentTask!.description && (
                                    <div className={styles.description}>
                                        <ReactMarkdown source={recordStore.currentTask!.description} />
                                    </div>
                                )
                            }
                        </div>
                        <div className={styles.instruction}>
                            {
                                recordStore.activeRecording ?
                                    'Recording! Click here to stop:' :
                                    'Click to start recording:'
                            }
                        </div>
                        <div className={styles.controls}>
                            <div className={styles.recordButtonContainer}>
                                {
                                    recordStore.activeRecording ?
                                        <RecordButton onClick={actions.stopRecording} className={styles.active}>{stopIcon}</RecordButton> :
                                        <RecordButton onClick={actions.startRecording}>{micIcon}</RecordButton>
                                }
                            </div>
                        </div>
                        <div className={styles.bottom} />
                    </>
                )
        }
        </div>
    );
});

const VerificationPhase = observer((p: {recordStore: RecordStore, actions: Actions}) => {
    const { actions, recordStore } = p;

    const isLast = recordStore.numCompletedTasks === recordStore.numTasks - 1;

    return (
        <div className={styles.verificationPhase}>
            <section>
                <span>
                    Thank you for your recording! <br />
                    You have completed {recordStore.numCompletedTasks + 1} out of {recordStore.numTasks} tasks thus far!
                </span>
            </section>
            <section>
                <div className={styles.controls}>
                    <Button secondary onClick={actions.playRecording}>
                        Play previous recording
                    </Button>
                    <Button secondary onClick={actions.redoRecording}>
                        Redo recording
                    </Button>
                    {
                        isLast ?
                            <Button onClick={actions.endSession}>
                                End session
                            </Button> :
                            <>
                                <Button onClick={actions.nextTask}>
                                    Next Recording
                                </Button>
                                {/* <Button secondary onClick={actions.endSession}>
                                    End session
                                </Button> */}
                            </>
                    }
                </div>
            </section>
        </div>
    );
});

const RecordPage = observer((p: Props): JSX.Element => {
    const globalStore = useGlobalStore();
    const recordStore = useLocalStore(() => new RecordStore());
    const history = useHistory();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!globalStore.formSubmissionId) {
            const fixedSubmissionId = process.env.REACT_APP_FIXED_SUBMISSION_ID;
            if (fixedSubmissionId) {
                globalStore.formSubmissionId = fixedSubmissionId;
            } else {
                history.replace(Routes.RecorderDetailsPage);
            }
        }
    }, [globalStore, history]);

    const actions: Actions = {
        startRecording: async () => {
            if (!recordStore.loading) {
                recordStore.loading = true;
                try {
                    const recording = await record();

                    // Add small delay to ensure recording isn't truncated at the beginning
                    // await new Promise(resolve => setTimeout(resolve, 300));

                    recordStore.activeRecording = recording;
                } catch (e) {
                    console.error(e);
                    alert("Couldn't connect to microphone. Are you sure it is connected?");
                } finally {
                    recordStore.loading = false;
                }
            }
        },
        stopRecording: async () => {
            if (!recordStore.loading && recordStore.activeRecording) {
                recordStore.loading = true;

                // Add small delay to ensure recording isn't truncated at the end
                await new Promise(resolve => setTimeout(resolve, 300));

                try {
                    const wavBlob = await recordStore.activeRecording.stop();

                    const url = window.URL.createObjectURL(wavBlob);

                    const audioElement = audioRef.current!;
                    audioElement.src = url;

                    if (!globalStore.formSubmissionId) {
                        throw new Error('Missing formSubmissionId');
                    }

                    if (!recordStore.currentTaskKey) {
                        throw new Error('Missing currentSentenceKey');
                    }

                    // We upload in background. We don't wait on the promise on purpose!
                    uploadRecording({
                        submissionId: globalStore.formSubmissionId,
                        recordingKey: recordStore.currentTaskKey,
                        recordedBlob: wavBlob
                    });

                    recordStore.verifyClip();
                } catch(e) {
                    console.error(e);
                    alert("Couldn't upload clip");
                } finally {
                    recordStore.activeRecording = null;
                    recordStore.loading = false;
                }
            }
        },
        playRecording: () => {
            audioRef.current?.play();
        },
        redoRecording: () => {
            recordStore.redoRecording();
        },
        nextTask: () => {
            audioRef.current?.pause();
            recordStore.selectNextTask();
        },
        endSession: () => {
            audioRef.current?.pause();
            recordStore.advanceToEnd();
        },
    };

    return (
        <EnforceAudioSupport>
            <div className={styles.container}>
                <audio style={{ display: 'none' }} ref={audioRef} />
                <div className={styles.content}>
                    {
                        recordStore.currentPhase === Phase.Recording ?
                            <RecordingPhase recordStore={recordStore} actions={actions} /> :
                            <VerificationPhase recordStore={recordStore} actions={actions} />
                    }
                </div>
            </div>
        </EnforceAudioSupport>
    );
});

export default RecordPage;
