export interface Template {
  id: string | null;
  name: string;
  required: boolean;
  config: {
    interfaces: WifiInterface[];
  };
}

export interface WifiInterface {
  disabled: boolean;
  name: string;
  wireless: {
    ssid: string;
    radio: string;
    ieee80211r: boolean;
    isolate: boolean;
    encryption: Personal | Enterprise | NoEncryption;
  };
}

export interface Personal {
  protocol: 'wpa2_personal';
  key: string;
  cipher: string;
}

export interface Enterprise {
  protocol: 'wpa2_enterprise';
  auth_server: string;
  auth_secret: string;
  acct_server: string;
  acct_secret: string;
  key: string;
  server: string;
}

export interface NoEncryption {
  protocol: 'none';
}
