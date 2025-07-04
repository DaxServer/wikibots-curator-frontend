export type StatusConfig = {
  [key in BotStatus['state']]: {
    text: string
    severity: BotStatus['severity']
    isRunning: boolean
  }
}

export type BotStatus = {
  state: 'running' | 'stopped' | 'error' | 'unknown' | 'pending' | 'failed'
  text: string
  severity: 'success' | 'danger' | 'info' | 'secondary'
  isRunning: boolean
  isPending: boolean
  startedAt?: Date
  statusLong: string
}

export interface Bot {
  type: string
  command: string
  args: string[]
  status: BotStatus
  jobName: string
}
