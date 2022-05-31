const API_KEY = '73d914033ea98b1c8ad41e6c22ebd55d'
const BASE_PATH = 'https://api.themoviedb.org/3'

interface IMovie {
  id: number
  backdrop_path: string
  poster_path: string
  title: string
  name: string
  overview: string
  release_date: string
  first_air_date: string
  genre_ids: number[]
  vote_average: number
}

interface ITvShow {
  id: number
  backdrop_path: string
  poster_path: string
  title: string
  name: string
  overview: string
  release_date: string
  first_air_date: string
  genre_ids: number[]
  vote_average: number
}

export interface IGetMoviesResult {
  dates: {
    maximum: string
    minimum: string
  }
  page: number
  results: IMovie[]
  total_pages: number
  total_results: number
}

export interface IGetTvShowsResult {
  dates: {
    maximum: string
    minimum: string
  }
  page: number
  results: ITvShow[]
  total_pages: number
  total_results: number
}

interface IGenre {
  id: number
  name: string
}

export interface IGetGenreResult {
  genre: IGenre[]
}

export function getNowPlayingMovies() {
  return fetch(
    `${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getTopRatedMovies() {
  return fetch(
    `${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getUpcomingMovies() {
  return fetch(
    `${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getAiringTodayTvShows() {
  return fetch(
    `${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getPopularTvShows() {
  return fetch(`${BASE_PATH}/tv/popular?api_key=${API_KEY}`).then((response) =>
    response.json(),
  )
}

export function getTopRatedTvShows() {
  return fetch(
    `${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getSearchMovies(keyword: string | null) {
  if (!keyword || keyword.trim().length === 0) {
    keyword = 'null'
  }
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}`,
  ).then((response) => response.json())
}

export function getSearchTvShows(keyword: string | null) {
  if (!keyword || keyword.trim().length === 0) {
    keyword = 'null'
  }
  return fetch(
    `${BASE_PATH}/search/tv?api_key=${API_KEY}&query=${keyword}`,
  ).then((response) => response.json())
}

export function getMovieGenre() {
  return fetch(
    `${BASE_PATH}/genre/movie/list?api_key=${API_KEY}`,
  ).then((response) => response.json())
}

export function getTvShowGenre() {
  return fetch(
    `${BASE_PATH}/genre/tv/list?api_key=${API_KEY}`,
  ).then((response) => response.json())
}
