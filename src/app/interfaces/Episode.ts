import {Subtitle} from "./Subtitle";
export interface Episode extends Object {
    episode: number;
    extension: string;
    file: string;
    format: string;
    group: string;
    name: string;
    season: number;
    show: string;
    type: string;
    videoCodec: string;
    subtitle: Subtitle;
}
