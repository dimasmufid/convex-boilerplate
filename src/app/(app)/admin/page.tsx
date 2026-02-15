"use client"

import * as React from "react"
import { IconShieldLock } from "@tabler/icons-react"
import { useMutation, useQuery } from "convex/react"
import { useViewer } from "@/hooks/use-viewer"
import {
  adminListUsersQuery,
  adminSetUserRoleMutation,
} from "@/lib/convex-functions"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Feedback = {
  variant: "default" | "destructive"
  text: string
} | null

export default function AdminPage() {
  const setUserRole = useMutation(adminSetUserRoleMutation)
  const { data: viewer, isLoading: isViewerLoading } = useViewer()
  const [search, setSearch] = React.useState("")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null)
  const isAdmin = viewer?.role === "admin"
  const searchValue = search.trim() || undefined

  const users = useQuery(
    adminListUsersQuery,
    !isViewerLoading && isAdmin ? { search: searchValue } : "skip"
  )
  const isUsersLoading = !isViewerLoading && isAdmin && users === undefined

  const handleSetUserRole = async (args: { userId: string; role: "user" | "admin" }) => {
    setFeedback(null)
    setPendingUserId(args.userId)
    try {
      await setUserRole(args)
      setFeedback({
        variant: "default",
        text:
          args.role === "admin"
            ? "User role updated to admin."
            : "User role updated to user.",
      })
    } catch (error) {
      setFeedback({
        variant: "destructive",
        text: error instanceof Error ? error.message : "Failed to update role.",
      })
    } finally {
      setPendingUserId(null)
    }
  }

  const renderUnauthorized = !isViewerLoading && !isAdmin
  const renderAdminTools = !isViewerLoading && isAdmin

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>
            Convex-backed admin tools for managing users and roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isViewerLoading ? <p>Loading your permissions...</p> : null}
          {renderUnauthorized ? (
            <Alert variant="destructive">
              <IconShieldLock />
              <AlertTitle>Admin permissions required</AlertTitle>
              <AlertDescription>
                Your account does not currently have the <code>admin</code> role.
              </AlertDescription>
            </Alert>
          ) : null}

          {renderAdminTools ? (
            <div className="space-y-4">
              {feedback ? (
                <Alert variant={feedback.variant}>
                  <AlertTitle>{feedback.variant === "destructive" ? "Error" : "Updated"}</AlertTitle>
                  <AlertDescription>{feedback.text}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users by name or email"
                  className="sm:max-w-sm"
                />
                <p className="text-muted-foreground text-sm">
                  {users?.length ?? 0} user{users?.length === 1 ? "" : "s"}
                </p>
              </div>

              {isUsersLoading ? <p>Loading users...</p> : null}

              {!isUsersLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.length ? (
                      users.map((user) => {
                        const isRowPending = pendingUserId === user._id
                        const nextRole = user.role === "admin" ? "user" : "admin"

                        return (
                          <TableRow key={user._id}>
                            <TableCell>{user.name?.trim() || "Unnamed user"}</TableCell>
                            <TableCell>{user.email?.trim() || "No email"}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={user.role === "admin" ? "outline" : "default"}
                                disabled={pendingUserId !== null}
                                onClick={() => {
                                  void handleSetUserRole({
                                    userId: user._id,
                                    role: nextRole,
                                  })
                                }}
                              >
                                {isRowPending
                                  ? "Updating..."
                                  : user.role === "admin"
                                    ? "Set as user"
                                    : "Set as admin"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
