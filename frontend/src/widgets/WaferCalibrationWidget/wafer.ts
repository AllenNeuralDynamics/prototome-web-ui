export type Apertures = {
  [uid: number]: Aperture;
};

export type ApertureStatus = "available" | "scheduled" | "used" | "damaged";

export type Aperture = {
  index: number;
  centroid: [number, number, number];
  metadata: string;
  shape: { [key: string]: number };
  status: ApertureStatus;
  substrate: string;
  tuid: string;
  uid: string;
};

export type RefPoints = {
  [id: string]: [number, number, number];
};

export type RefPointsStatus = {
  [id: string]: RefPointStatus;
};

export type RefPointStatus = {
  position: [number, number, number];
  status: boolean;
};

export type Wafer = {
  apertures: Apertures;
  calibration_status: string;
  media_id: string;
  metadata: { [key: string]: string };
  path: string;
  plane_eq: [number, number, number, number];
  refpoint: RefPoints;
  refpoints: RefPointsStatus;
  refpoint_world: RefPoints;
  status: string;
  tf: string | null;
  uid: string;
};

export type NavigatorData = {
  next_aperture_id: string;
  current_position: { [id: string]: number };
};
