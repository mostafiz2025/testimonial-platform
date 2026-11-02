export type TestimonialType = "text" | "video";
export type WallTheme = "light" | "dark";
export type WallLayout = "masonry" | "grid";

export interface Space {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  header_title: string;
  custom_message: string;
  questions: string[];
  collect_text: boolean;
  collect_video: boolean;
  collect_star_rating: boolean;
  collect_email: boolean;
  collect_company: boolean;
  collect_job_title: boolean;
  collect_photo: boolean;
  thank_you_title: string;
  thank_you_message: string;
  button_color: string;
  is_active: boolean;
  wall_theme: WallTheme;
  wall_layout: WallLayout;
  wall_show_rating: boolean;
  wall_show_date: boolean;
  wall_show_branding: boolean;
  created_at: string;
  testimonials_count?: number;
  owner?: UserSummary;
}

export type SpaceInput = Omit<
  Space,
  "id" | "logo" | "created_at" | "testimonials_count" | "owner"
>;

export type PublicSpace = Pick<
  Space,
  | "id" | "name" | "slug" | "logo" | "header_title" | "custom_message" | "questions"
  | "collect_text" | "collect_video" | "collect_star_rating" | "collect_email"
  | "collect_company" | "collect_job_title" | "collect_photo"
  | "thank_you_title" | "thank_you_message" | "button_color"
>;

export interface Testimonial {
  id: number;
  type: TestimonialType;
  name: string;
  email?: string | null;
  job_title: string | null;
  company: string | null;
  photo: string | null;
  video: string | null;
  rating: number | null;
  message: string | null;
  source?: "collected" | "imported";
  is_liked?: boolean;
  is_archived?: boolean;
  created_at: string;
  space?: Space;
}

export interface TestimonialCounts {
  inbox: number;
  text: number;
  video: number;
  liked: number;
  archived: number;
}

export type TestimonialFilter = "inbox" | "text" | "video" | "liked" | "archived";

export interface TestimonialList {
  items: Testimonial[];
  total: number;
  page: number;
  limit: number;
  counts: TestimonialCounts;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  company: string | null;
  profile_image: string | null;
  is_banned?: boolean;
  created_at?: string;
  spaces_count?: number;
}

export interface UserStats {
  total_spaces: number;
  total_testimonials: number;
  text_testimonials: number;
  video_testimonials: number;
  liked_testimonials: number;
  last_7_days: number;
  average_rating: number | null;
  per_day: { day: string; count: number }[];
}

export interface WallData {
  space: Pick<
    Space,
    "name" | "slug" | "logo" | "button_color" | "wall_theme" | "wall_layout"
    | "wall_show_rating" | "wall_show_date" | "wall_show_branding"
  >;
  testimonials: Testimonial[];
}

export interface AdminStats {
  total_users: number;
  total_spaces: number;
  total_testimonials: number;
  video_testimonials: number;
  text_testimonials: number;
  liked_testimonials: number;
}
