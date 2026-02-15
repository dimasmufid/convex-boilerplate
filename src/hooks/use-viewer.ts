"use client"

import { useQuery } from "@tanstack/react-query"
import { useConvex, useConvexAuth } from "convex/react"
import { viewerQuery, type Viewer } from "@/lib/convex-functions"

export function useViewer() {
  const convex = useConvex()
  const { isAuthenticated, isLoading } = useConvexAuth()

  return useQuery<Viewer>({
    queryKey: ["viewer", isAuthenticated],
    enabled: !isLoading,
    queryFn: async () => {
      if (!isAuthenticated) {
        return null
      }

      return await convex.query(viewerQuery, {})
    },
  })
}
