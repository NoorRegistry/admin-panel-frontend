export type Unpacked<T> = T extends (infer U)[] ? U : T;

export interface IAccessToken {
  accessToken: string;
  deviceId: string;
  refreshToken: string;
}
