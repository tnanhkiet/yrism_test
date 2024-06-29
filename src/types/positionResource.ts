export interface ToolLanguageResource {
  toolLanguageResourceId: number;
  positionResourceId: number;
  name: string;
}

interface PositionResource {
  positionResourceId: number;
  name: string;
  toolLanguageResources: ToolLanguageResource[];
  id: string;
}

export default PositionResource