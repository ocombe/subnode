import {Episode} from "./Episode";
import {Season} from "./Season";

export interface Show {
    showId: string;
    seasons: Array<Season>;
}
