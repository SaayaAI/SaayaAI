export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppChangeValue;
  field: string;
}

export interface WhatsAppChangeValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  document?: {
    id: string;
    mime_type: string;
    filename?: string;
    caption?: string;
  };
  audio?: { id: string; mime_type: string };
  video?: { id: string; mime_type: string; caption?: string };
  sticker?: { id: string; mime_type: string };
  location?: { latitude: number; longitude: number; name?: string };
}

export interface WhatsAppStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

export interface WhatsAppSendMessagePayload {
  messaging_product: "whatsapp";
  recipient_type?: "individual";
  to: string;
  type: "text";
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface WhatsAppMediaUrlResponse {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
  id: string;
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}
