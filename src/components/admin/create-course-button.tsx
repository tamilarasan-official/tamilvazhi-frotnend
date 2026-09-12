"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Label, Textarea } from "../ui";
import { PlusIcon, SpinnerIcon } from "../icons";
import { Modal } from "./modal";
import { apiPost, ApiError } from "@/lib/client";

export function CreateCourseButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const data = await apiPost<{ course: { id: string } }>("/api/courses", {
        title,
        subtitle,
        description,
      });

      setOpen(false);
      setTitle("");
      setSubtitle("");
      setDescription("");
      router.push(`/admin/courses/${data.course.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the course.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        New course
      </Button>

      <Modal open={open} onClose={() => !pending && setOpen(false)} title="Create a course">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="course-title">Course title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Physics — Class 12"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="course-subtitle">Short description</Label>
            <Input
              id="course-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Full syllabus with notes and solved papers"
            />
          </div>

          <div>
            <Label htmlFor="course-description">Details (optional)</Label>
            <Textarea
              id="course-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What students will find inside this course."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || title.trim().length < 2}>
              {pending ? (
                <>
                  <SpinnerIcon className="h-4 w-4" />
                  Creating…
                </>
              ) : (
                "Create course"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
