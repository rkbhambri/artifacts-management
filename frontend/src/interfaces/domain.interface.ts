export interface Customer {
  id: string;
  name: string;
  systems?: System[];
  createdAt: string;
}

export interface System {
  id: string;
  name: string;
  customerId: string;
  customer?: Customer;
  createdAt: string;
}

export interface Artifact {
  id: string;
  systemId: string;
  name: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  version: number;
  createdAt: string;
}

export interface ArtifactCreatedEvent {
  systemId: string;
  artifactId: string;
  name: string;
  version: number;
  sizeBytes: number;
  createdAt: string;
}
