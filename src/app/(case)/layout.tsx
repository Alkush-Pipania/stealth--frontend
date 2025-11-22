import { SidebarProvider } from "@/components/ui/sidebar"

export default function CaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}
