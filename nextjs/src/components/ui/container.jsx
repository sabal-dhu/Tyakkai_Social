import { cn } from "@/lib/utils"

export function Container({ className, ...props }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)} {...props} />
}
