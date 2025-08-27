export interface CameraConfig {
    type: "camera";
    kwds: {
      index: number;
      exposure_range: { min: number; max: number; step: number };
      gain_range: { min: number; max: number; range: number };
    };
  }
  
  export interface StageConfig {
    type: "stage";
    host: string;
    axes: string[]
  }
  
  export interface AppConfig {
    host: string;
    [key: string]: CameraConfig | StageConfig | string; 
  }