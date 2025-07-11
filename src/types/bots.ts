type Severity = 'success' | 'danger' | 'info' | 'secondary' | 'warning'

export type StatusInfo = {
  label: string
  text?: string
  severity: Severity
}

type Action = {
  type: 'start' | 'stop' | 'terminate' | 'pending' | 'unknown'
  label: string
  severity: Severity
}

export type StatusConfig = {
  [key in BotStatus['state']]: {
    info: StatusInfo
    action: Action
  }
}

export type BotStatus = {
  state: 'running' | 'stopped' | 'error' | 'unknown' | 'pending' | 'failed'
  info: StatusInfo
  isRunning: boolean
  isPending: boolean
  startedAt?: Date
  action: Action
}

export interface Bot {
  type: string
  command: string
  args: string[]
  status: BotStatus
  jobName: string
}
