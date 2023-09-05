export interface IConfig {
  ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  GAME_COLOR_BAG: Array<IHSLColor>;
}

export interface IHSLColor {
  hue: number;
  saturation: number;
  lightness: number;
}
