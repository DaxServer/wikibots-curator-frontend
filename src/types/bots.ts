export type StatusConfig = {
  [key in BotStatus['state']]: {
    text: string;
    severity: BotStatus['severity'];
    isRunning: boolean;
  };
};

export type BotStatus = {
  state: 'running' | 'stopped' | 'error' | 'unknown' | 'pending' | 'failed';
  text: string;
  severity: 'success' | 'danger' | 'info';
  isRunning: boolean;
  isPending: boolean;
};

export interface Bot {
  type: string;
  command: string;
  args: string[];
  status: BotStatus;
  jobName: string;
}
