export interface IQueue {
  connect?(): Promise<void>;
  enqueue(data: any): Promise<void>;
  process(handler: (data: any) => Promise<void>): void; // Method to process items from the queue
  close?(): Promise<void>;
}
