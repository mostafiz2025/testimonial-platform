import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Video } from "lucide-react";

export interface CollectionLike {
  name: string;
  logo?: string | null;
  /** local preview url (blob:) - used only in the live preview */
  logoPreview?: string | null;
  header_title: string;
  custom_message: string;
  questions: string[];
  button_color: string;
  collect_text: boolean;
  collect_video: boolean;
}

interface Props {
  space: CollectionLike;
  onText?: () => void;
  onVideo?: () => void;
}

/** Logo + title + message + questions + the two action buttons */
export function CollectionHeader({ space, onText, onVideo }: Props) {
  const color = space.button_color || "#6366f1";
  const questions = space.questions.filter((q) => q.trim());

  return (
    <div className="text-center">
      {space.logoPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={space.logoPreview} alt={space.name} className="mx-auto size-16 rounded-2xl object-cover" />
      ) : (
        <Avatar name={space.name || "?"} src={space.logo} size={64} color={color} className="mx-auto rounded-2xl" />
      )}

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        {space.header_title || "Share your experience"}
      </h1>
      <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-neutral-600">{space.custom_message}</p>

      {questions.length > 0 && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-neutral-50 p-4 text-left">
          <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">Questions</p>
          <ul className="space-y-1.5 text-sm text-neutral-700">
            {questions.map((q, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color }}>•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3">
        {space.collect_video && (
          <Button type="button" onClick={onVideo} style={{ backgroundColor: color }}
            className="h-12 w-full text-base text-white hover:opacity-90">
            <Video className="size-5" /> Record a video
          </Button>
        )}
        {space.collect_text && (
          <Button type="button" variant={space.collect_video ? "outline" : "default"} onClick={onText}
            style={space.collect_video ? { borderColor: color, color } : { backgroundColor: color }}
            className={space.collect_video ? "h-12 w-full bg-white text-base hover:bg-neutral-50" : "h-12 w-full text-base text-white hover:opacity-90"}>
            <Pencil className="size-5" /> Send a text testimonial
          </Button>
        )}
      </div>
    </div>
  );
}
