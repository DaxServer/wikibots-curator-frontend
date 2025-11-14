const STATUS_CONFIG: StatusConfig = {
  running: {
    info: { label: 'Running', severity: 'success' },
    action: { type: 'stop', label: 'Stop', severity: 'danger' },
  },
  stopped: {
    info: { label: 'Not Running', severity: 'secondary' },
    action: { type: 'start', label: 'Start', severity: 'secondary' },
  },
  pending: {
    info: { label: 'Starting...', severity: 'info' },
    action: { type: 'pending', label: 'Starting...', severity: 'info' },
  },
  error: {
    info: { label: 'Error', severity: 'danger' },
    action: { type: 'terminate', label: 'Terminate', severity: 'danger' },
  },
  failed: {
    info: { label: 'Failed', severity: 'danger' },
    action: { type: 'unknown', label: 'Unknown', severity: 'danger' },
  },
  unknown: {
    info: { label: 'Unknown', severity: 'danger' },
    action: { type: 'unknown', label: 'Unknown', severity: 'danger' },
  },
}

/**
 * Creates a status object based on the job status
 */
export const createStatusFromJob = (statusLong: string): BotStatus => {
  const statusLower = statusLong.toLowerCase()
  let state: BotStatus['state']
  let startedAt: Date | undefined

  // Highest priority: Specific CrashLoopBackOff with 'waiting' state
  if (statusLower.includes('crashloopbackoff') && statusLower.includes("state 'waiting'")) {
    state = 'error'
  } else if (statusLower.includes("pod in 'pending' phase")) {
    state = 'pending'
  } else if (statusLower.includes("pod in 'running' phase")) {
    state = 'running'
    const startedAtIndex = statusLong.indexOf("Started at '")
    if (startedAtIndex !== -1) {
      const dateString = statusLong.substring(
        startedAtIndex + 12,
        statusLong.indexOf("'", startedAtIndex + 12),
      )
      const parsedStartedAt = new Date(dateString)
      if (!Number.isNaN(parsedStartedAt.getTime())) {
        startedAt = parsedStartedAt
      }
    }
  } else if (
    statusLower.includes('error') ||
    statusLower.includes('failed') ||
    statusLower.includes('crashloopbackoff')
  ) {
    // Fallback for other error conditions, including general CrashLoopBackOff
    state = 'error'
  } else {
    state = 'stopped'
  }

  const baseStatus: BotStatus = {
    state,
    ...STATUS_CONFIG[state],
    info: {
      ...STATUS_CONFIG[state].info,
      text: statusLong,
    },
    isRunning: state === 'running',
    isPending: state === 'pending',
  }

  if (startedAt) {
    return { ...baseStatus, startedAt }
  }

  return baseStatus
}

export const useBotStatus = () => {
  const botStore = useBotsStore()
  const jobStore = useJobsStore()
  const harborStore = useHarborStore()

  const isLoading = computed(() => {
    return botStore.isLoading || jobStore.isLoading || harborStore.isLoading
  })

  /**
   * Updates bots with job status information
   * @param bots - The array of bots to update
   * @param jobs - The array of jobs to get status from
   * @returns Updated array of bots with job status
   */
  const updateBotsWithJobStatus = (bots: Bot[], jobs: Job[]): Bot[] => {
    return bots.map((bot) => {
      const matchingJob = jobs.find((job) => job.cmd?.includes(bot.type) || job.name === bot.type)

      if (!matchingJob) {
        return {
          ...bot,
          status: {
            ...bot.status,
            ...STATUS_CONFIG.stopped,
            state: 'stopped',
            isRunning: false,
            isPending: false,
          },
          jobName: '',
        }
      }

      return {
        ...bot,
        status: {
          ...bot.status,
          ...createStatusFromJob(matchingJob.status_long),
        },
        jobName: matchingJob.name || '',
      }
    })
  }

  return {
    isLoading,
    updateBotsWithJobStatus,
    statusConfig: STATUS_CONFIG,
  }
}

export default useBotStatus
