export type CameraWidgetProps = {
  cameraId: string;
  exposureSpecs: SliderSpecs;
  gainSpecs: SliderSpecs;
};

type SliderSpecs = {
  step: number;
  min: number;
  max: number;
}
