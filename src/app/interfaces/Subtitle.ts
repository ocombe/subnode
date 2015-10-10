import {Episode} from "./Episode";

export interface SubtitleContent extends Episode {
    score: number;
}

export interface Subtitle {
    title: string;
    season: number;
    episode: number,
    language: string;
    source: string;
    file: string;
    url: string;
    quality: number;
    content: Array<SubtitleContent>;
    downloaded?: Boolean;
}

export interface SubtitlePack {
    content: Subtitle;
    episode: number;
    file: string;
    language: string;
    quality: number;
    season: number;
    source: string;
    title: string;
    url: string;
}
