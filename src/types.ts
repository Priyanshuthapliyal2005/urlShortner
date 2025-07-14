export interface UrlData {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clicks: Click[];
  clickCount: number;
  isExpired: boolean;
  lastClicked?: string;
}

export interface Click {
  timestamp: string;
  ip: string;
  userAgent: string;
  referrer: string;
}

export interface CreateUrlRequest {
  urls: string[];
  validity?: number;
  shortcode?: string;
}

export interface CreateUrlResponse {
  success: boolean;
  urls: UrlData[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  memory: any;
  version: string;
  totalUrls: number;
  totalClicks: number;
}