import { IQueueItem } from './interfaces';
export declare const enum QUEUE_STATE {
    Pause = 1
}
export default class Queue {
    private name;
    private globalOptions;
    private options;
    private _queueBeingFlushed;
    private targetQueues;
    private index;
    private _queue;
    constructor(name: string, options?: any, globalOptions?: any);
    stackFor(index: any): any;
    consoleTaskFor(index: any, inQueueBeingFlushed?: boolean): any;
    flush(sync?: Boolean): QUEUE_STATE.Pause | undefined;
    hasWork(): boolean;
    cancel({ target, method }: {
        target: any;
        method: any;
    }): boolean;
    push(target: any, method: any, args: any, stack: any, consoleTask: any): {
        queue: Queue;
        target: any;
        method: any;
    };
    pushUnique(target: any, method: any, args: any, stack: any, consoleTask: any): {
        queue: Queue;
        target: any;
        method: any;
    };
    _getDebugInfo(debugEnabled: boolean): IQueueItem[] | undefined;
    private invoke;
    private invokeWithOnError;
}
