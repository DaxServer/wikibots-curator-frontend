import { UPLOAD_STATUS, type UploadStatus } from '@/types/image'

export const COLOR_VARIANTS = {
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    labelColor: 'text-gray-600',
    labelColorInactive: 'text-gray-300',
    countColor: 'text-gray-900',
    countColorInactive: 'text-gray-200',
    ring: 'ring-gray-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    labelColor: 'text-green-600',
    labelColorInactive: 'text-green-300',
    countColor: 'text-green-700',
    countColorInactive: 'text-green-200',
    ring: 'ring-green-500',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    labelColor: 'text-red-600',
    labelColorInactive: 'text-red-300',
    countColor: 'text-red-700',
    countColorInactive: 'text-red-200',
    ring: 'ring-red-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    labelColor: 'text-fuchsia-600',
    labelColorInactive: 'text-fuchsia-300',
    countColor: 'text-fuchsia-700',
    countColorInactive: 'text-fuchsia-200',
    ring: 'ring-fuchsia-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    labelColor: 'text-blue-600',
    labelColorInactive: 'text-blue-300',
    countColor: 'text-blue-700',
    countColorInactive: 'text-blue-200',
    ring: 'ring-blue-500',
  },
} as const

export type ColorVariant = keyof typeof COLOR_VARIANTS

export const useUploadStatus = () => {
  const getStatusColor = (status: UploadStatus | 'all'): ColorVariant => {
    switch (status) {
      case UPLOAD_STATUS.Completed:
        return 'green'
      case UPLOAD_STATUS.Failed:
        return 'red'
      case UPLOAD_STATUS.Duplicate:
        return 'fuchsia'
      case UPLOAD_STATUS.InProgress:
        return 'blue'
      case UPLOAD_STATUS.Queued:
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getStatusSeverity = (status: UploadStatus) => {
    switch (status) {
      case UPLOAD_STATUS.InProgress:
        return 'info'
      case UPLOAD_STATUS.Queued:
        return 'secondary'
      case UPLOAD_STATUS.Failed:
        return 'danger'
      case UPLOAD_STATUS.Duplicate:
        return 'contrast'
      case UPLOAD_STATUS.Completed:
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getStatusStyle = (status: UploadStatus) => {
    if (status === UPLOAD_STATUS.Duplicate) {
      return { backgroundColor: 'var(--p-fuchsia-50)', color: 'var(--p-fuchsia-800)' }
    }
    return {}
  }

  return {
    getStatusColor,
    getStatusSeverity,
    getStatusStyle,
  }
}
