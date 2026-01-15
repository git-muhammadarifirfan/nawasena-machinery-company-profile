export type Category = {
  id: string;
  name: string;
  created_at?: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_recommended: boolean;
  features: string[]; // ✅ FIX: selalu array
  created_at?: string;
  category?: Category | null;
};

export type SettingsRow = {
  key: string;
  value: string;
};

export type CartItem = {
  product: Product;
  qty: number;
};

export type Inquiry = {
  id: number;
  created_at?: string;
  customer_name: string;
  whatsapp: string;
  business_name?: string | null;
  location: string;
  notes?: string | null;
  items: { id: string; title: string; price: number; qty: number }[];
};
