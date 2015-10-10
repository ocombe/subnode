import {Episode} from "./Episode";

export interface Season {
    episodes: Array<Episode>;
    season: number;
    missingSubs?: number;
}
