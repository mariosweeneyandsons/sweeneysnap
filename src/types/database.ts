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
  maxUploadsPerSession?: number;
  countdownSeconds?: number;
  flashEnabled?: boolean;
  allowCameraSwitch?: boolean;
  multiPhotoEnabled?: boolean;
  filtersEnabled?: boolean;
  framesEnabled?: boolean;
  stickersEnabled?: boolean;
  // Social sharing
  shareEnabled?: boolean;
  shareHashtag?: string;
  shareText?: string;
  // Email/SMS delivery
  collectEmail?: boolean;
  collectPhone?: boolean;
  // Photo booth mode
  boothAutoResetSeconds?: number;
  boothCaptureCountdown?: boolean;
  boothIdleMessage?: string;
  // Gallery
  galleryEnabled?: boolean;
  galleryAvailableAfterEvent?: boolean;
  galleryAllowDownload?: boolean;
  galleryHeaderText?: string;
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
  type: "logo" | "background" | "overlay" | "frame" | "sticker";
  name: string;
  storageId?: string;
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
  customCss?: string;
  updatedAt: number;
}

export interface Event extends ConvexDocument {
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  presetId?: string;
  crewToken?: string;
  uploadConfig: UploadConfig;
  displayConfig: DisplayConfig;
  logoUrl?: string;
  primaryColor: string;
  fontFamily?: string;
  customCss?: string;
  moderationEnabled: boolean;
  aiModerationEnabled?: boolean;
  startsAt?: number;
  endsAt?: number;
  archived?: boolean;
  sortOrder?: number;
  assets?: BrandAsset[];
  updatedAt: number;
  // Custom domain
  customDomain?: string;
  // Print config
  printConfig?: {
    enabled: boolean;
    autoPrintOnApproval?: boolean;
    printStationToken?: string;
  };
}

export type PrintJobStatus = "queued" | "printing" | "printed" | "failed";

export interface PrintJob extends ConvexDocument {
  selfieId: string;
  eventId: string;
  status: PrintJobStatus;
  copies?: number;
  errorMessage?: string;
  queuedAt: number;
  printedAt?: number;
}

export type CrewPermission = "moderator" | "viewer";
export type CrewAction = "approve" | "reject" | "reset" | "delete";

export interface CrewMember extends ConvexDocument {
  eventId: string;
  name: string;
  token: string;
  permission: CrewPermission;
  createdAt: number;
}

export interface CrewActivityLogEntry extends ConvexDocument {
  eventId: string;
  crewMemberId?: string;
  crewToken: string;
  action: CrewAction;
  selfieId?: string;
  timestamp: number;
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
  // Image optimization
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  // Email/SMS delivery
  email?: string;
  phone?: string;
  deliveryStatus?: "pending" | "sent" | "failed";
  deliveredAt?: number;
}
