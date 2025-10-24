import { AppConfig } from "./configTypes";

export interface HomePageProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}
