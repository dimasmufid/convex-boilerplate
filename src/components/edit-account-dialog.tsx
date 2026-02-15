"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useConvex } from "convex/react"
import {
  generateAvatarUploadUrlMutation,
  removeAvatarMutation,
  setAvatarMutation,
  updateProfileMutation,
} from "@/lib/convex-functions"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"

type EditAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewer: {
    name?: string
    avatarUrl?: string | null
    email?: string
  } | null
}

export function EditAccountDialog({
  open,
  onOpenChange,
  viewer,
}: EditAccountDialogProps) {
  const convex = useConvex()
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: async (args: { name?: string }) => {
      return await convex.mutation(updateProfileMutation, args)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["viewer"] })
    },
  })

  const generateUploadUrl = useMutation({
    mutationFn: async () => {
      return await convex.mutation(generateAvatarUploadUrlMutation, {})
    },
  })

  const setAvatar = useMutation({
    mutationFn: async (args: { storageId: string }) => {
      return await convex.mutation(setAvatarMutation, args)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["viewer"] })
    },
  })

  const removeAvatar = useMutation({
    mutationFn: async () => {
      return await convex.mutation(removeAvatarMutation, {})
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["viewer"] })
    },
  })

  const [name, setName] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  )
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setName(viewer?.name ?? "")
    setImagePreview(viewer?.avatarUrl ?? null)
    setStatus("idle")
    setMessage(null)
  }, [open, viewer?.avatarUrl, viewer?.name])

  const getInitials = (value: string) => {
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }

  const setSavedState = (text: string) => {
    setStatus("saved")
    setMessage(text)
    window.setTimeout(() => {
      setStatus("idle")
      setMessage(null)
    }, 1600)
  }

  const handleSaveName = async () => {
    if (!viewer || status === "saving") {
      return
    }

    setStatus("saving")
    setMessage("Saving...")

    try {
      await updateProfile.mutateAsync({
        name,
      })
      setSavedState("Saved.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Update failed.")
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !viewer) return

    const localPreviewUrl = URL.createObjectURL(file)
    setImagePreview(localPreviewUrl)
    setStatus("saving")
    setMessage("Uploading image...")

    try {
      const uploadUrl = await generateUploadUrl.mutateAsync()
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed.")
      }

      const payload = (await response.json()) as { storageId?: string }
      if (!payload.storageId) {
        throw new Error("Upload did not return a storage id.")
      }

      await setAvatar.mutateAsync({ storageId: payload.storageId })
      setSavedState("Image saved.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Image upload failed.")
      setImagePreview(viewer.avatarUrl ?? null)
    } finally {
      URL.revokeObjectURL(localPreviewUrl)
    }
  }

  const handleRemoveImage = async () => {
    if (!viewer) return

    setStatus("saving")
    setMessage("Removing image...")

    try {
      await removeAvatar.mutateAsync()
      setImagePreview(null)
      setSavedState("Image removed.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Image remove failed.")
    }
  }

  const isSaving =
    status === "saving" ||
    updateProfile.isPending ||
    generateUploadUrl.isPending ||
    setAvatar.isPending ||
    removeAvatar.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name and profile image.
          </DialogDescription>
        </DialogHeader>
        <ItemGroup className="rounded-xl border bg-card">
          <Item>
            <Avatar className="size-14">
              <AvatarImage
                src={imagePreview ?? undefined}
                alt={name || viewer?.email || "Profile image"}
              />
              <AvatarFallback>
                {getInitials(name || viewer?.email || "User") || "U"}
              </AvatarFallback>
            </Avatar>
            <ItemContent>
              <ItemTitle>Profile image</ItemTitle>
              <ItemDescription>Upload to Convex Storage and link to your account.</ItemDescription>
            </ItemContent>
            <ItemActions className="flex gap-2">
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-56"
              />
              <Button type="button" variant="outline" onClick={handleRemoveImage} disabled={isSaving}>
                Remove
              </Button>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemContent>
              <ItemTitle>Name</ItemTitle>
              <ItemDescription>This name appears across the application.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Input
                id="edit-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="max-w-56"
              />
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemContent>
              <ItemTitle>Email</ItemTitle>
              <ItemDescription>{viewer?.email ?? "No email"}</ItemDescription>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemContent>
              <ItemTitle>Status</ItemTitle>
              <ItemDescription>
                {status === "idle" ? "No pending changes." : message}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button type="button" onClick={handleSaveName} disabled={isSaving || !viewer}>
                {isSaving ? "Saving..." : "Save name"}
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </DialogContent>
    </Dialog>
  )
}
