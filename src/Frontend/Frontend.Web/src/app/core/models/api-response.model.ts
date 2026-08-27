export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timeStamp: string;
}
