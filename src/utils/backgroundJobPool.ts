import { observable, computed } from "mobx";

type QueueItem<JobParameters, JobResult> = {
	jobId: number,
    parameters: JobParameters,
    job: Job<JobParameters, JobResult>,
	resolve: (result: JobResult) => void,
	reject: (error: Error) => void,
};

type Job<JobRequest, JobResult> = (request: JobRequest) => Promise<JobResult>;
type JobId = number;

export class BackgroundJobPool {
	private static _globalJobId: JobId = 0;

	@observable private readonly pendingQueue = new Map<JobId, QueueItem<any, any>>();
	@observable private readonly ongoingQueue = new Map<JobId, QueueItem<any, any>>();
    private readonly maxWorkers: number;

	constructor(maxWorkers = 3) {
        this.maxWorkers = maxWorkers;
    }

	@computed get remainingRequestsCount() {
        return this.ongoingQueue.size + this.pendingQueue.size;
    }

	upload<JobParameters, JobResult>(parameters: JobParameters, job: Job<JobParameters, JobResult>): Promise<JobResult> {
		return new Promise((resolve, reject) => {
			const jobId = this.generateJobId();
			const queueItem: QueueItem<JobParameters, JobResult> = { jobId, parameters, job, resolve, reject };
			this.pendingQueue.set(jobId, queueItem);

            this.checkNextQueueItem();
		});
	}

	private async runWorker<JobParameters, JobResult>(queueItem: QueueItem<JobParameters, JobResult>) {
        this.ongoingQueue.set(queueItem.jobId, queueItem);

        try {
            const result = await queueItem.job(queueItem.parameters);
            queueItem.resolve(result);
        } catch(e) {
            queueItem.reject(e);
        } finally {
            this.ongoingQueue.delete(queueItem.jobId);
            this.checkNextQueueItem();
        }
    }
    
    private checkNextQueueItem() {
        const runningWorkers = this.ongoingQueue.size;
        if (runningWorkers < this.maxWorkers) {

            const queueEmpty = this.pendingQueue.size === 0;
            if (!queueEmpty) {
                const firstPendingItem = this.pendingQueue.values().next().value;
                this.pendingQueue.delete(firstPendingItem.jobId);
                this.runWorker(firstPendingItem);
            }

        }
    }

	private generateJobId(): JobId {
		return BackgroundJobPool._globalJobId++;
	}
}
