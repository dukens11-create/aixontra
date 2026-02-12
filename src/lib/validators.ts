import { z } from "zod";

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile schemas
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .nullable()
    .optional(),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be less than 50 characters")
    .nullable()
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").nullable().optional(),
  avatar_url: z.string().url("Invalid URL").nullable().optional(),
});

// Track schemas
export const trackUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable().optional(),
  genre: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  ai_tool: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  language: z.string().default("en"),
  explicit_content: z.boolean().default(false),
});

export const trackUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable().optional(),
  genre: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  ai_tool: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  language: z.string().optional(),
  explicit_content: z.boolean().optional(),
  cover_path: z.string().nullable().optional(),
});

// Comment schemas
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be less than 1000 characters"),
  parent_id: z.string().uuid().nullable().optional(),
});

// Playlist schemas
export const playlistCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").nullable().optional(),
  is_public: z.boolean().default(true),
  cover_url: z.string().url("Invalid URL").nullable().optional(),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").nullable().optional(),
  is_public: z.boolean().optional(),
  cover_url: z.string().url("Invalid URL").nullable().optional(),
});

// Report schemas
export const reportSchema = z.object({
  track_id: z.string().uuid().nullable().optional(),
  comment_id: z.string().uuid().nullable().optional(),
  reason: z.string().min(1, "Reason is required").max(50, "Reason must be less than 50 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").nullable().optional(),
}).refine(
  (data) => data.track_id || data.comment_id,
  {
    message: "Either track_id or comment_id must be provided",
  }
);

// Admin schemas
export const reviewTrackSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  review_note: z.string().max(500, "Review note must be less than 500 characters").nullable().optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  ai_tool: z.string().optional(),
  sort: z.enum(["recent", "popular", "plays", "likes"]).optional(),
  explicit: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(30),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional(),
});

// Audio file validation
export const audioFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => {
      const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac"];
      return allowedTypes.includes(file.type);
    },
    { message: "File must be an audio file (MP3, WAV, OGG, or FLAC)" }
  ).refine(
    (file) => file.size <= 50 * 1024 * 1024, // 50MB
    { message: "File size must be less than 50MB" }
  ),
});

// Image file validation
export const imageFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      return allowedTypes.includes(file.type);
    },
    { message: "File must be an image (JPEG, PNG, or WebP)" }
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    { message: "File size must be less than 5MB" }
  ),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(30),
});

// Types derived from schemas
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TrackUploadInput = z.infer<typeof trackUploadSchema>;
export type TrackUpdateInput = z.infer<typeof trackUpdateSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type PlaylistCreateInput = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdateInput = z.infer<typeof playlistUpdateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ReviewTrackInput = z.infer<typeof reviewTrackSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
