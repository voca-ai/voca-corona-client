import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BackgroundJobPool } from './backgroundJobPool';

const deviceIdKey = 'deviceId';
// const backendHost = 'http://localhost:4000/';
// const backendHost = 'https://65806b6b.ngrok.io';
const backendHost = process.env.REACT_APP_BACKEND_HOST || window.location.origin;

console.log('backendUrl', backendHost);


export const backgroudnUploader = new BackgroundJobPool();

const request = axios.create({
	baseURL: backendHost,
});

const strictFetch: typeof fetch = async (...p: Parameters<typeof fetch>) => {
	const response = await fetch(...p);

	if (!response.ok) {
		throw new Error('Network error');
	}

	return response;
}

export async function createSubmission(params: {
	user: { email: string },
	formRevision: number,
	formData: any,
}) {
	let deviceId = localStorage.getItem(deviceIdKey);

	if (!deviceId) {
		deviceId = process.env.REACT_APP_FIXED_DEVICE_ID || uuidv4();
		localStorage.setItem(deviceIdKey, deviceId);
	}

	const userAgent = navigator.userAgent;
	const { user, formRevision, formData } = params;

	const body = { 
		user: {
			email: user.email,
		},
		userAgent,
		deviceId,
		formRevision,
		formData,
	}
	const result = await request.post(`/submissions`, body);
	const { data } = result;

	return data.submissionId;
}

type UploadRecordingRequest = {
	submissionId: string,
	recordingKey: string,
	recordedBlob: Blob,
};
async function uploadRecordingHandler(request: UploadRecordingRequest) {
		const { submissionId, recordingKey, recordedBlob } = request;

		const fileType = 'audio/wav';

		await new Promise(resolve => setTimeout(resolve, 1000));

		console.log('Saving recording on server');
		const response = await axios.post(`${backendHost}/submissions/${submissionId}/recordings/${recordingKey}`, { fileType });
		const presignedS3Url: string = response.data.presignedS3Url;
		const key: string = response.data.key;
		
		console.log('Uploading recording content to S3:', { presignedS3Url, key });
		const file = new File([recordedBlob], key);
		await strictFetch(presignedS3Url, {
			method: 'PUT',
			body: file,
			headers: { 'Content-Type': fileType },
		});

}

export async function uploadRecording(uploadRecordingRequest: UploadRecordingRequest) {
	// downloadRecordedBlob(recordedBlob);
	const result = await backgroudnUploader.upload(uploadRecordingRequest, uploadRecordingHandler);
	return result;
}

export async function submitFeedback(submissionId: string, feedback: string) {
	await request.put(`/submissions/${submissionId}/feedback`, { feedback });
}
