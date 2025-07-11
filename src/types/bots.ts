type Action = {
  type: 'start' | 'stop' | 'terminate' | 'pending' | 'unknown'
  label: string
}

export type StatusConfig = {
  [key in BotStatus['state']]: {
    text: string
    severity: BotStatus['severity']
    isRunning: boolean
    action: Action
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
  action: Action
}

export interface Bot {
  type: string
  command: string
  args: string[]
  status: BotStatus
  jobName: string
}
