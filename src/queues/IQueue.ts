export interface IQueue {
  createQueue(queueName: string): Promise<IQueue>;
  connect(): Promise<void>;
  enqueue(data: any): Promise<void>;
  process(queueName: string, handler: (data: any) => Promise<void>): void; // Update here
  close(): Promise<void>;
}
