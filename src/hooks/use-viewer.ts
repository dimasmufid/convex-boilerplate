"use client"

import { useConvexAuth, useQuery } from "convex/react"
import { viewerQuery, type Viewer } from "@/lib/convex-functions"

export function useViewer() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const viewer = useQuery(viewerQuery, isAuthenticated ? {} : "skip")
  const isViewerLoading = isAuthenticated && viewer === undefined

  return {
    data: (isAuthenticated ? viewer : null) as Viewer | undefined,
    isLoading: isLoading || isViewerLoading,
  }
}
