export interface APIResponseImage {
  filename: string;
  image_id: string;
  original_filename: string | undefined;
  format: string | undefined; // 例: "JPEG", "PNG" など
  height: number | undefined;
  width: number | undefined;
  duration: number | null | undefined; // 動画の場合は数値、画像の場合はnullになる可能性があります
  published: boolean | undefined;
  suppressed_global: boolean | undefined;
  suppressed_global_reason: string | undefined; // JSON文字列化された配列のようですので、string型とします。必要に応じてパースしてください。
  created_on: string; // ISO 8601 形式の日時文字列 (例: "2025-05-11T23:41:55.949703Z")
  filename_full: string | undefined;
  signed_url: string; // 画像への署名付きURL
  owner_username: string;
  owner_first_name: string | undefined;
  requires_login: boolean | undefined;
}
