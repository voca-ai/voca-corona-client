// Based on:
// https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/

declare global {
	type ExportWavCallback = (blob: Blob) => void;
	class Recorder {
		constructor(input: MediaStreamAudioSourceNode, options: any);

		record(): void;
		stop(): void;
		exportWAV(callback: ExportWavCallback, mimeType: string): void;
		clear(): void;
	}
}

export type Recording = {
	stop: () => Promise<Blob>,
};

const isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
// const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const AudioContext: typeof window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const isAudioSupported = () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

let audioContext: AudioContext | null = null;
export async function record(): Promise<Recording> {
	if (!isAudioSupported()) {
		throw new Error('Audio not supported');
	}

	const constraints: MediaStreamConstraints = {
		audio: isEdge ? true : {
			echoCancellation: false,

		},
		video: false,
	};

	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	if (audioContext) {
		audioContext.close();
	}
	audioContext = new AudioContext();

	const input = audioContext.createMediaStreamSource(stream);
	const recorder = new Recorder(input, {
		numChannels: 1,
	});

	console.log('start recording')
	recorder.record();

	const stopRecording = (mimeType = 'audio/wav') => new Promise<Blob>((resolve, reject) => {
		console.log('stop recording')
		try {
			recorder.stop(); // Stop recording
			stream.getAudioTracks()[0].stop(); // Stop microphone access

			recorder.exportWAV(blob => {
				console.log('blob ready', blob)
				resolve(blob);
				recorder.clear(); // Clear recorded buffer for next recording
			}, mimeType);
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});

	return { stop: stopRecording };
}

export function downloadRecordedBlob(recordedBlob: Blob, fileName: string = 'test.wav') {
	const url = window.URL.createObjectURL(recordedBlob);
	const a: any = document.createElement('a');
	document.body.appendChild(a);
	a.style = 'display: none';
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
}
