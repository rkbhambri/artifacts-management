import { Artifact } from './domain.interface';

export interface SystemViewProps {
  systemId: string;
}

export interface ArtifactTableProps {
  artifacts: Artifact[];
  highlightedId: string | null;
}

export interface UploadFormProps {
  systemId: string;
  onUploaded: () => void;
}
