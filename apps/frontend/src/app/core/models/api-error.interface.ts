export interface ApiErrorInterface {
  code: string;
  message: string;
  userMessage: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  timestamp?: string;
}
