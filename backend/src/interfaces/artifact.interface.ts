export interface UploadArtifactInput {
  systemId: string;
  name?: string;
  file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

export interface ArtifactDownload {
  filename: string;
  mimeType: string;
  content: Buffer;
}
