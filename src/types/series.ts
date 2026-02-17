export type Comment = {
  id: string;
  email: string;
  seriesID: string;
  text: string;
  createdAt: string;
};
export interface Series {
  id: number;
  title: string;
  image: string;
  rating: number;
}
export type TmdbItem = {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
};
