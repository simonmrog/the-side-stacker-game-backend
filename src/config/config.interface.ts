export interface IConfig {
  ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  POSTGRES_HOST: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  GAME_COLOR_BAG: Array<IHSLColor>;
}

export interface IHSLColor {
  hue: number;
  saturation: number;
  lightness: number;
}
