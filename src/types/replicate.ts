export interface ReplicatePredictionInput {
  image: string;
  prompt: string;
  [key: string]: any;
}

export interface ReplicatePredictionResponse {
  id: string;
  version: string;
  urls: {
    cancel: string;
    get: string;
  };
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: ReplicatePredictionInput;
  output: string[] | string | null;
  error: string | null;
  logs: string | null;
  metrics: {
    predict_time: number | null;
  };
}

export interface ProcessIAHomeRequest {
  imageUrl: string;
  prompt: string;
  maxAttempts?: number;
}

export interface ProcessIAHomeResponse {
  success: boolean;
  result?: string | string[];
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  hasReplicateToken: boolean;
  hasModelVersionId: boolean;
  configured: boolean;
  timestamp: string;
}
