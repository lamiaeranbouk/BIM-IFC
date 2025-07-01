export interface IfcType {
  expressID: number;
  type: string;
  checked?: boolean;
  level?: number;
  levelIndex?: number;
  parentID?: number;
  parentExtracted?: boolean;
  selfExtracted?: boolean;
  children?: IfcType[];
}

export interface IfcCategory {
  type: string;
  value: string | number; // Allow both string and number
}

export interface SearchResult {
  type: string;
  expressID: number;
  name?: string;
  value?: any;
}

export interface IfcProperty {
  name: string;
  value: any;
}

export interface IfcPropertySet {
  propertyset: string;
  data: IfcProperty[];
}

export interface IfcMetadata {
  name: string;
  value: string;
}
