import { IQueueItem } from './interfaces';
import Queue, { QUEUE_STATE } from './queue';
export interface IDebugInfo {
    [key: string]: IQueueItem[] | undefined;
}
export default class DeferredActionQueues {
    queues: {
        [name: string]: Queue;
    };
    queueNameIndex: number;
    private queueNames;
    constructor(queueNames: string[] | undefined, options: any);
    /**
     * @method schedule
     * @param {String} queueName
     * @param {Any} target
     * @param {Any} method
     * @param {Any} args
     * @param {Boolean} onceFlag
     * @param {Any} stack
     * @return queue
     */
    schedule(queueName: string, target: any, method: any, args: any, onceFlag: boolean, stack: any, consoleTask: any): {
        queue: Queue;
        target: any;
        method: any;
    };
    /**
     * DeferredActionQueues.flush() calls Queue.flush()
     *
     * @method flush
     * @param {Boolean} fromAutorun
     */
    flush(fromAutorun?: boolean): QUEUE_STATE.Pause | undefined;
    /**
     * Returns debug information for the current queues.
     *
     * @method _getDebugInfo
     * @param {Boolean} debugEnabled
     * @returns {IDebugInfo | undefined}
     */
    _getDebugInfo(debugEnabled: boolean): IDebugInfo | undefined;
}
