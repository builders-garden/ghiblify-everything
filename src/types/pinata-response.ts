export type PinataResponse = {
  success: boolean;
  data?: {
    imageUrl: string;
    metadataUrl: string;
    metadataCID: string;
  };
  error?: string;
};
