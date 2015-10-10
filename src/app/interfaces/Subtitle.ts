import {Episode} from "./Episode";

export interface SubtitleContent extends Episode {
    score: number;
}

export interface Subtitle {
    title: string;
    season: number;
    episode: Episode,
    language: string;
    source: string;
    file: string;
    url: string;
    quality: number;
    content: Array<SubtitleContent>;
}
