export type CameraWidgetProps = {
  cameraId: string;
  host: string;
  exposureSpecs: SliderSpecs;
  gainSpecs: SliderSpecs;
};

class SliderSpecs {
  step: number;
  min: number;
  max: number;
}
