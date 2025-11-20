export type CameraWidgetProps = {
  cameraId: string;
  exposureSpecs: SliderSpecs;
  gainSpecs: SliderSpecs;
};

class SliderSpecs {
  step: number;
  min: number;
  max: number;
}
