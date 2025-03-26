export type UploadResponse = {
  success: boolean;
  files?: {
    key: string;
    name: string;
    url: string;
    uploadedBy: string;
  }[];
  error?: string;
};
