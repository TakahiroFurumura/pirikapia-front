import {NovelChapterProps} from "components/NovelChapter.vue";
import {NovelThumbnailChapterProps} from "components/NovelThumbnailChapter.vue";

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
  tags: object;
  bookmark: boolean;
  bookmark_folder: string | undefined;
  bookmark_count: number;
}

export function apiResponseToThumbnailProps(rawData: APIResponseImage) {
  return {
    filename: rawData.filename,
    image_id: rawData.image_id,
    signed_url: rawData.signed_url,
    owner_username: rawData.owner_username,
    title: '',
    favorite_count: 0,
    comment_count: 0,
    requires_login: rawData.requires_login,
    bookmark: rawData.bookmark,
    bookmark_count: rawData.bookmark_count,
  }
}

export interface APIResponseNovelChapter {
  novel_title_id: number;
  chapter_title: string;
  chapter_order: number;
  chapter_str_id: string;
  chapter_images: [];
  chapter_description: string;
}


export function apiResponseToNovelThumbnailChapterProps(rawData: APIResponseNovelChapter) {
  return {
    novelId: rawData.novel_title_id,
    chapterStrId: rawData.chapter_str_id,
    chapterTitle: rawData.chapter_title,
    coverImage: "",
    description: rawData.chapter_description,
  }
}



export interface APIResponseNovel {
  novel_title: string;
  cover_image: string;
  novel_chapters: APIResponseNovelChapter[];
  description: string;
  novel_id: 6;
}


export function apiResponseToNovelThumbnailProps(rawData: APIResponseNovel) {
  return {
    novelTitle: rawData.novel_title,
    coverImage: rawData.cover_image,
    novelChapters: rawData.novel_chapters.map((rawItem: APIResponseNovelChapter): NovelThumbnailChapterProps => { return apiResponseToNovelThumbnailChapterProps(rawItem)}),
    description: rawData.description,
    novelId: rawData.novel_id,
  }
}
