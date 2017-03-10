import Queue from './queue';
import {
  each,
  noSuchQueue,
  noSuchMethod
} from './utils';

export default class DeferredActionQueues {
  public queues: {
    [name: string]: Queue
  };

  private queueNames: string[];

  private options: any;

  constructor(queueNames: string[], options: any) {
    var queues = this.queues = {};
    this.queueNames = queueNames = queueNames || [];

    this.options = options;

    each(queueNames, function(queueName) {
      queues[queueName] = new Queue(queueName, options[queueName], options);
    });
  }

  public schedule(name, target, method, args, onceFlag, stack) {
    var queues = this.queues;
    var queue = queues[name];

    if (!queue) {
      noSuchQueue(name);
    }

    if (!method) {
      noSuchMethod(name);
    }

    if (onceFlag) {
      return queue.pushUnique(target, method, args, stack);
    } else {
      return queue.push(target, method, args, stack);
    }
  }

  public flush() {
    var queue;
    var queueName;
    var queueNameIndex = 0;
    var numberOfQueues = this.queueNames.length;

    while (queueNameIndex < numberOfQueues) {
      queueName = this.queueNames[queueNameIndex];
      queue = this.queues[queueName];

      if (queue._queue.length === 0) {
        queueNameIndex++;
      } else {
        queue.flush(false /* async */);
        queueNameIndex = 0;
      }
    }
  }
}
