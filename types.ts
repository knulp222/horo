// types.ts

export interface BatteryInfo {
  level: number;
  charging: boolean;
}

export interface TestResult {
  photoUrl: string;
  screenshotUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  battery?: BatteryInfo;
  clipboardText?: string;
}

// Le type de données envoyé à l'API
export interface ApiPayload extends TestResult {
  comment?: string;
}
