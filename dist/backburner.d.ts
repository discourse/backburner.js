export { buildPlatform, IPlatform } from './backburner/platform';
import { buildNext, buildPlatform, IPlatform } from './backburner/platform';
import DeferredActionQueues from './backburner/deferred-action-queues';
export type { DeferredActionQueues };
import { Iterable } from './backburner/iterator-drain';
import Queue from './backburner/queue';
export declare type Timer = string | number;
export interface IBackburnerOptions {
    defaultQueue?: string;
    onBegin?: (currentInstance: DeferredActionQueues, previousInstance: DeferredActionQueues) => void;
    onEnd?: (currentInstance: DeferredActionQueues, nextInstance: DeferredActionQueues) => void;
    onError?: (error: any, errorRecordedForStack?: any) => void;
    onErrorTarget?: any;
    onErrorMethod?: string;
    mustYield?: () => boolean;
    _buildPlatform?: (flush: () => void) => IPlatform;
    flush?(queueName: string, flush: () => void): void;
}
export default class Backburner {
    static Queue: typeof Queue;
    static buildPlatform: typeof buildPlatform;
    static buildNext: typeof buildNext;
    DEBUG: boolean;
    ASYNC_STACKS: boolean;
    currentInstance: DeferredActionQueues | null;
    options: IBackburnerOptions;
    get counters(): {
        begin: number;
        end: number;
        events: {
            begin: number;
            end: number;
        };
        autoruns: {
            created: number;
            completed: number;
        };
        run: number;
        join: number;
        defer: number;
        schedule: number;
        scheduleIterable: number;
        deferOnce: number;
        scheduleOnce: number;
        setTimeout: number;
        later: number;
        throttle: number;
        debounce: number;
        cancelTimers: number;
        cancel: number;
        loops: {
            total: number;
            nested: number;
        };
    };
    private _onBegin;
    private _onEnd;
    private queueNames;
    private instanceStack;
    private _eventCallbacks;
    private _timerTimeoutId;
    private _timers;
    private _platform;
    private _boundRunExpiredTimers;
    private _autorun;
    private _autorunStack;
    private _boundAutorunEnd;
    private _defaultQueue;
    constructor(queueNames: string[], options?: IBackburnerOptions);
    get defaultQueue(): string;
    begin(): DeferredActionQueues;
    end(): void;
    on(eventName: any, callback: any): void;
    off(eventName: any, callback: any): void;
    run(target: Function): any;
    run(target: Function | any | null, method?: Function | string, ...args: any[]): any;
    run(target: any | null | undefined, method?: Function, ...args: any[]): any;
    join(target: Function): any;
    join(target: Function | any | null, method?: Function | string, ...args: any[]): any;
    join(target: any | null | undefined, method?: Function, ...args: any[]): any;
    /**
     * @deprecated please use schedule instead.
     */
    defer(queueName: any, target: any, method: any, ...args: any[]): any;
    /**
     * Schedule the passed function to run inside the specified queue.
     */
    schedule(queueName: string, method: Function): any;
    schedule<T, U extends keyof T>(queueName: string, target: T, method: U, ...args: any[]): any;
    schedule(queueName: string, target: any, method: any | Function, ...args: any[]): any;
    scheduleIterable(queueName: string, iterable: () => Iterable): {
        queue: Queue;
        target: any;
        method: any;
    };
    /**
     * @deprecated please use scheduleOnce instead.
     */
    deferOnce(queueName: any, target: any, method: any, ...args: any[]): any;
    /**
     * Schedule the passed function to run once inside the specified queue.
     */
    scheduleOnce(queueName: string, method: Function): any;
    scheduleOnce<T, U extends keyof T>(queueName: string, target: T, method: U, ...args: any[]): any;
    scheduleOnce(queueName: string, target: any | null, method: any | Function, ...args: any[]): any;
    /**
     * @deprecated use later instead.
     */
    setTimeout(...args: any[]): any;
    later<T>(...args: any[]): Timer;
    later<T>(target: T, methodName: keyof T, wait?: number | string): Timer;
    later<T>(target: T, methodName: keyof T, arg1: any, wait?: number | string): Timer;
    later<T>(target: T, methodName: keyof T, arg1: any, arg2: any, wait?: number | string): Timer;
    later<T>(target: T, methodName: keyof T, arg1: any, arg2: any, arg3: any, wait?: number | string): Timer;
    later(thisArg: any | null, method: () => void, wait?: number | string): Timer;
    later<A>(thisArg: any | null, method: (arg1: A) => void, arg1: A, wait?: number | string): Timer;
    later<A, B>(thisArg: any | null, method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait?: number | string): Timer;
    later<A, B, C>(thisArg: any | null, method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait?: number | string): Timer;
    later(method: () => void, wait?: number | string): Timer;
    later<A>(method: (arg1: A) => void, arg1: A, wait?: number | string): Timer;
    later<A, B>(method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait?: number | string): Timer;
    later<A, B, C>(method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait?: number | string): Timer;
    throttle<T>(target: T, methodName: keyof T, wait?: number | string, immediate?: boolean): Timer;
    throttle<T>(target: T, methodName: keyof T, arg1: any, wait?: number | string, immediate?: boolean): Timer;
    throttle<T>(target: T, methodName: keyof T, arg1: any, arg2: any, wait?: number | string, immediate?: boolean): Timer;
    throttle<T>(target: T, methodName: keyof T, arg1: any, arg2: any, arg3: any, wait?: number | string, immediate?: boolean): Timer;
    throttle(thisArg: any | null, method: () => void, wait?: number | string, immediate?: boolean): Timer;
    throttle<A>(thisArg: any | null, method: (arg1: A) => void, arg1: A, wait?: number | string, immediate?: boolean): Timer;
    throttle<A, B>(thisArg: any | null, method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait?: number | string, immediate?: boolean): Timer;
    throttle<A, B, C>(thisArg: any | null, method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait?: number | string, immediate?: boolean): Timer;
    throttle(method: () => void, wait?: number | string, immediate?: boolean): Timer;
    throttle<A>(method: (arg1: A) => void, arg1: A, wait?: number | string, immediate?: boolean): Timer;
    throttle<A, B>(method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait?: number | string, immediate?: boolean): Timer;
    throttle<A, B, C>(method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait?: number | string, immediate?: boolean): Timer;
    debounce<T>(target: T, methodName: keyof T, wait: number | string, immediate?: boolean): Timer;
    debounce<T>(target: T, methodName: keyof T, arg1: any, wait: number | string, immediate?: boolean): Timer;
    debounce<T>(target: T, methodName: keyof T, arg1: any, arg2: any, wait: number | string, immediate?: boolean): Timer;
    debounce<T>(target: T, methodName: keyof T, arg1: any, arg2: any, arg3: any, wait: number | string, immediate?: boolean): Timer;
    debounce(thisArg: any | null, method: () => void, wait: number | string, immediate?: boolean): Timer;
    debounce<A>(thisArg: any | null, method: (arg1: A) => void, arg1: A, wait: number | string, immediate?: boolean): Timer;
    debounce<A, B>(thisArg: any | null, method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait: number | string, immediate?: boolean): Timer;
    debounce<A, B, C>(thisArg: any | null, method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait: number | string, immediate?: boolean): Timer;
    debounce(method: () => void, wait: number | string, immediate?: boolean): Timer;
    debounce<A>(method: (arg1: A) => void, arg1: A, wait: number | string, immediate?: boolean): Timer;
    debounce<A, B>(method: (arg1: A, arg2: B) => void, arg1: A, arg2: B, wait: number | string, immediate?: boolean): Timer;
    debounce<A, B, C>(method: (arg1: A, arg2: B, arg3: C) => void, arg1: A, arg2: B, arg3: C, wait: number | string, immediate?: boolean): Timer;
    cancelTimers(): void;
    hasTimers(): boolean;
    cancel(timer?: any): any;
    ensureInstance(): void;
    /**
     * Returns debug information related to the current instance of Backburner
     *
     * @method getDebugInfo
     * @returns {Object | undefined} Will return and Object containing debug information if
     * the DEBUG flag is set to true on the current instance of Backburner, else undefined.
     */
    getDebugInfo(): {
        autorun: Error | null | undefined;
        counters: {
            begin: number;
            end: number;
            events: {
                begin: number;
                end: number;
            };
            autoruns: {
                created: number;
                completed: number;
            };
            run: number;
            join: number;
            defer: number;
            schedule: number;
            scheduleIterable: number;
            deferOnce: number;
            scheduleOnce: number;
            setTimeout: number;
            later: number;
            throttle: number;
            debounce: number;
            cancelTimers: number;
            cancel: number;
            loops: {
                total: number;
                nested: number;
            };
        };
        timers: import("./backburner/interfaces").IQueueItem[];
        instanceStack: (import("./backburner/deferred-action-queues").IDebugInfo | null | undefined)[];
    } | undefined;
    private _end;
    private _join;
    private _run;
    private _cancelAutorun;
    private _later;
    private _cancelLaterTimer;
    /**
     Trigger an event. Supports up to two arguments. Designed around
     triggering transition events from one run loop instance to the
     next, which requires an argument for the  instance and then
     an argument for the next instance.
  
     @private
     @method _trigger
     @param {String} eventName
     @param {any} arg1
     @param {any} arg2
     */
    private _trigger;
    private _runExpiredTimers;
    private _scheduleExpiredTimers;
    private _reinstallTimerTimeout;
    private _clearTimerTimeout;
    private _installTimerTimeout;
    private _ensureInstance;
    private _scheduleAutorun;
    private createTask;
}
