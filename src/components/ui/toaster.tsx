import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isAnalysisUpdated = title === "Analysis Updated";
        
        return (
          <Toast key={id} {...props} className={isAnalysisUpdated ? "w-[340px]" : undefined}>
            <div className="grid gap-1">
              {title && <ToastTitle className={isAnalysisUpdated ? "text-base font-bold" : undefined}>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={isAnalysisUpdated ? "whitespace-pre-line font-mono text-xs leading-6" : "whitespace-pre-line"}>
                  {description}
                </ToastDescription>
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
