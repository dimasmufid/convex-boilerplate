"use client"

import { IconShieldLock } from "@tabler/icons-react"
import { useViewer } from "@/hooks/use-viewer"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  const { data: viewer, isLoading } = useViewer()
  const isAdmin = viewer?.role === "admin"

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>
            Better Auth admin APIs were removed in this Convex Auth migration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <p>Loading your permissions...</p> : null}
          {!isLoading && !isAdmin ? (
            <Alert variant="destructive">
              <IconShieldLock />
              <AlertTitle>Admin permissions required</AlertTitle>
              <AlertDescription>
                Your account does not currently have the <code>admin</code> role.
              </AlertDescription>
            </Alert>
          ) : null}
          {!isLoading && isAdmin ? (
            <p>
              You are signed in as an admin. Add project-specific admin operations as Convex
              functions and wire them here.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
