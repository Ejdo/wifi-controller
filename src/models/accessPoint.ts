export interface AccessPoint {
  id: string;
  name: string;
  last_ip: string;
  model: string;
  config: {
    status: string;
    templates: string[] | null;
    config: {
      radios: Radio[] | null;
    };
  };
}

export interface Radio {
  channel: number;
  disabled: boolean;
  channel_width: number;
  tx_power: number;
  protocol: string;
  name: string;
}
