"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useConvex } from "convex/react"
import { updateProfileMutation } from "@/lib/convex-functions"

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
    image?: string
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
    mutationFn: async (args: { name?: string; image?: string }) => {
      return await convex.mutation(updateProfileMutation, args)
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
    setImagePreview(viewer?.image ?? null)
    setStatus("idle")
    setMessage(null)
  }, [open, viewer?.image, viewer?.name])

  const getInitials = (value: string) => {
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }

  const handleSave = async () => {
    if (!viewer || status === "saving") {
      return
    }

    setStatus("saving")
    setMessage("Saving...")

    try {
      await updateProfile.mutateAsync({
        name,
        image: imagePreview ?? "",
      })
      setStatus("saved")
      setMessage("Saved.")
      window.setTimeout(() => {
        setStatus("idle")
        setMessage(null)
      }, 1600)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Update failed.")
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      setImagePreview(result)
    }
    reader.onerror = () => {
      setStatus("error")
      setMessage("Failed to read the selected image.")
    }
    reader.readAsDataURL(file)
  }

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
              <ItemDescription>Upload a new image to personalize your account.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-56"
              />
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
              <Button type="button" onClick={handleSave} disabled={status === "saving" || !viewer}>
                {status === "saving" ? "Saving..." : "Save changes"}
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </DialogContent>
    </Dialog>
  )
}
