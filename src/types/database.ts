// Application types matching the Convex schema (camelCase)
// These will be replaced with Doc<"tableName"> once `npx convex dev` generates types

export type SelfieStatus = "pending" | "approved" | "rejected";

export interface AiModeration {
  flagged: boolean;
  categories: string[];
  confidence: number;
  autoRejected: boolean;
  analyzedAt: number;
}

export interface UploadConfig {
  maxFileSizeMb?: number;
  allowGallery?: boolean;
  requireName?: boolean;
  requireMessage?: boolean;
  welcomeText?: string;
  buttonText?: string;
  successText?: string;
}

export interface DisplayConfig {
  gridColumns?: number;
  swapInterval?: number;
  transition?: "fade" | "slide" | "zoom";
  backgroundColor?: string;
  showNames?: boolean;
  showMessages?: boolean;
  overlayOpacity?: number;
  frameBorderColor?: string;
  frameBorderWidth?: number;
  // Layout mode
  layoutMode?: "grid" | "slideshow" | "mosaic";
  // Background
  backgroundImageId?: string;
  backgroundVideoId?: string;
  animatedBackground?: "none" | "gradient";
  // Spotlight
  spotlightEnabled?: boolean;
  spotlightInterval?: number;
  spotlightDuration?: number;
  // Ticker
  tickerEnabled?: boolean;
  tickerText?: string;
  // Countdown
  countdownEnabled?: boolean;
  // Social overlay
  socialOverlay?: string;
  // Sound
  newSelfieSound?: "none" | "chime" | "shutter";
  // Celebration
  celebrationEffect?: "none" | "confetti" | "ripple" | "glow";
}

export interface BrandAsset {
  url: string;
  type: "logo" | "background" | "overlay";
  name: string;
}

interface ConvexDocument {
  _id: string;
  _creationTime: number;
}

export interface AdminProfile extends ConvexDocument {
  userId?: string;
  email: string;
  displayName: string;
  role: string;
}

export interface Preset extends ConvexDocument {
  name: string;
  createdBy?: string;
  uploadConfig: UploadConfig;
  displayConfig: DisplayConfig;
  logoUrl?: string;
  primaryColor: string;
  fontFamily: string;
  assets: BrandAsset[];
  updatedAt: number;
}

export interface Event extends ConvexDocument {
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  presetId?: string;
  crewToken: string;
  uploadConfig: UploadConfig;
  displayConfig: DisplayConfig;
  logoUrl?: string;
  primaryColor: string;
  moderationEnabled: boolean;
  aiModerationEnabled?: boolean;
  startsAt?: number;
  endsAt?: number;
  archived?: boolean;
  sortOrder?: number;
  updatedAt: number;
}

export interface Selfie extends ConvexDocument {
  eventId: string;
  storageId: string;
  imageUrl: string | null;
  displayName?: string;
  message?: string;
  status: SelfieStatus;
  sessionId?: string;
  fileSizeBytes?: number;
  aiModeration?: AiModeration;
}
