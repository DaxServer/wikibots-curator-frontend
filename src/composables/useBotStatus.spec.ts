import { describe, expect, it } from 'bun:test'
import { createStatusFromJob } from './useBotStatus'

describe('useBotStatus', () => {
  it('should correctly identify CrashLoopBackOff with state waiting', () => {
    const statusLong =
      "Last run at 2025-07-02T09:19:01Z. Pod in 'Running' phase. Pod has been restarted 95 times. State 'waiting'. Reason 'CrashLoopBackOff'. Additional message:'back-off 5m0s restarting failed container=job pod=inaturalist-6f9f6584cf-r4tk2_tool-curator(3c2f56b9-2d0d-472a-9347-ff3d83a04956)'."
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('error')
    expect(status.info.label).toBe('Error')
    expect(status.info.severity).toBe('danger')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('terminate')
    expect(status.action.label).toBe('Terminate')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify pending state', () => {
    const statusLong = "Pod in 'Pending' phase. Status last updated at 2024-08-15T10:00:00Z"
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('pending')
    expect(status.info.label).toBe('Starting...')
    expect(status.info.severity).toBe('info')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(true)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('pending')
    expect(status.action.label).toBe('Starting...')
    expect(status.action.severity).toBe('info')
  })

  it('should correctly identify running state without StartedAt', () => {
    const statusLong = "Pod in 'Running' phase. Status last updated at 2024-08-15T10:05:00Z"
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('running')
    expect(status.info.label).toBe('Running')
    expect(status.info.severity).toBe('success')
    expect(status.startedAt).toBeUndefined()
    expect(status.isRunning).toBe(true)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('stop')
    expect(status.action.label).toBe('Stop')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify running state with StartedAt', () => {
    const statusLong =
      "Pod in 'Running' phase. Started at '2024-08-15T10:05:00Z'. Status last updated at 2024-08-15T10:10:00Z"
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('running')
    expect(status.info.label).toBe('Running')
    expect(status.info.severity).toBe('success')
    expect(status.startedAt).toEqual(new Date('2024-08-15T10:05:00Z'))
    expect(status.isRunning).toBe(true)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('stop')
    expect(status.action.label).toBe('Stop')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify running state with malformed StartedAt', () => {
    const statusLong =
      "Pod in 'Running' phase. Started at 'invalid-date'. Status last updated at 2024-08-15T10:10:00Z"
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('running')
    expect(status.info.label).toBe('Running')
    expect(status.info.severity).toBe('success')
    expect(status.startedAt).toBeUndefined()
    expect(status.isRunning).toBe(true)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('stop')
    expect(status.action.label).toBe('Stop')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify generic error state', () => {
    const statusLong = 'Job has encountered an error. Details: Some error message.'
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('error')
    expect(status.info.label).toBe('Error')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('terminate')
    expect(status.action.label).toBe('Terminate')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify failed state', () => {
    const statusLong = 'Job run failed. Reason: Max attempts reached.'
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('error') // 'failed' in statusLong maps to 'error' state based on current logic
    expect(status.info.label).toBe('Error')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('terminate')
    expect(status.action.label).toBe('Terminate')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify CrashLoopBackOff without state waiting as error', () => {
    const statusLong = "Pod has been restarted multiple times. Reason 'CrashLoopBackOff'."
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('error')
    expect(status.info.label).toBe('Error')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('terminate')
    expect(status.action.label).toBe('Terminate')
    expect(status.action.severity).toBe('danger')
  })

  it('should correctly identify stopped state for unrecognized status', () => {
    const statusLong = 'Job is not currently active. Last status unknown.'
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('stopped')
    expect(status.info.label).toBe('Not Running')
    expect(status.info.severity).toBe('secondary')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('start')
    expect(status.action.label).toBe('Start')
    expect(status.action.severity).toBe('secondary')
  })

  it('should handle empty status string as stopped', () => {
    const statusLong = ''
    const status = createStatusFromJob(statusLong)
    expect(status.state).toBe('stopped')
    expect(status.info.label).toBe('Not Running')
    expect(status.isRunning).toBe(false)
    expect(status.isPending).toBe(false)
    expect(status.info.text).toBe(statusLong)
    expect(status.action.type).toBe('start')
    expect(status.action.label).toBe('Start')
    expect(status.action.severity).toBe('secondary')
  })
})
