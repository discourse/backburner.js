import { IQueueItem } from './interfaces';
export declare const QUEUE_ITEM_LENGTH = 5;
export declare const TIMERS_OFFSET = 7;
export declare function isCoercableNumber(suspect: any): boolean;
export declare function getOnError(options: any): any;
export declare function findItem(target: any, method: any, collection: any): number;
export declare function findTimerItem(target: any, method: any, collection: any): number;
export declare function getQueueItems(items: any[], queueItemLength: number, queueItemPositionOffset?: number): IQueueItem[];
