"use client"

import { CheckCircle2, XCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

function ToastIcon({ variant }: { variant?: string }) {
  if (variant === 'success') return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
  if (variant === 'destructive') return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
  return <Info className="h-5 w-5 text-foreground/60 shrink-0" />
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <ToastIcon variant={props.variant as string} />
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
