// server/lib/response.ts — Helper format response API konsisten
// Semua response API berformat { success, data, message }

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

/** Response sukses */
export function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { success: true, data, message };
}

/** Response error */
export function err(message: string): ApiResponse<null> {
  return { success: false, data: null, message };
}
