import { toast } from 'react-toastify'

export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastError(message: string) {
  toast.error(message)
}

export function toastInfo(message: string) {
  toast.info(message)
}
