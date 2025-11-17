import MainLayout from "@/components/layouts/main-layout";
import CameraWidget from "@/features/camera-widget/components/camera-widget";
import LassoControl from "@/features/camera-widget/components/lasso-control";
import WaferCalibration from "@/features/wafer-calibration/components/wafer-calibration";

const HomeRoute = () => {
  return (
    <MainLayout>
      <div className="space-y-30 mb-30">
        <CameraWidget />
        <LassoControl />
        <WaferCalibration />
      </div>
    </MainLayout>
  );
};

export default HomeRoute;
