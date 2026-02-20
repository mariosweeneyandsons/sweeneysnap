// Application types matching the Convex schema (camelCase)
// These will be replaced with Doc<"tableName"> once `npx convex dev` generates types

export type SelfieStatus = "pending" | "approved" | "rejected";

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
  startsAt?: number;
  endsAt?: number;
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
}
