export type CameraWidgetProps = {
  cameraId: string;
  host: string;
  exposureSpecs: SliderSpecs;
  gainSpecs: SliderSpecs;
};

type SliderSpecs = {
  step: number;
  min: number;
  max: number;
}
