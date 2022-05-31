import { useQuery } from 'react-query'
import styled from 'styled-components'
import {
  getAiringTodayTvShows,
  getPopularTvShows,
  getTopRatedTvShows,
  IGetTvShowsResult,
} from '../api'
import { makeImagePath } from '../utils'
import { motion, AnimatePresence, useViewportScroll } from 'framer-motion'
import { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'

const Wrapper = styled.div`
  background-color: black;
`

const Loader = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`

const Overview = styled.span`
  font-size: 30px;
  width: 50%;
`

const Slider = styled.div`
  position: relative;
  top: -100px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 5px;
  position: absolute;
  width: 100%;
`

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  height: 200px;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`

const Info = styled(motion.div)`
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
  }
`

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`

const BigTvShow = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: fit-content;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: auto;
  background-color: ${(props) => props.theme.black.lighter};
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #2f3542;
    border-radius: 10px;
    background-clip: padding-box;
    border: 1px solid transparent;
  }
  &::-webkit-scrollbar-track {
    background-color: ${(props) => props.theme.black.lighter};
    border-radius: 10px;
    box-shadow: inset 0px 0px 5px white;
  }
`

const BigCover = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center center;
`

const BigButtonBox = styled.div`
  padding: 15px;
  margin: 15px;
  border-radius: 15px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: black;
  svg {
    width: 40px;
    cursor: pointer;
  }
`

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
`

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
`

const BigInfo = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SliderCategory = styled.div`
  position: relative;
  top: -200px;
  margin-bottom: 65px;
`

const SliderTitle = styled.div`
  margin: 20px;
  font-size: 30px;
  font-weight: 600;
`

const SliderButton = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  button {
    height: 200px;
    border: none;
    width: 50px;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 10;
    cursor: pointer;
    svg {
      width: 25px;
    }
  }
`

const rowVariants = {
  hidden: (slideRight: boolean) => ({
    x: slideRight ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
  visible: {
    x: 0,
  },
  exit: (slideRight: boolean) => ({
    x: slideRight ? -window.outerWidth - 5 : window.outerWidth + 5,
  }),
}

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    y: -50,
    scale: 1.3,
    trasition: {
      delay: 0.3,
      type: 'tween',
    },
  },
}

const InfoVariants = {
  hover: {
    opacity: 1,
    trasition: {
      delay: 0.3,
      type: 'tween',
    },
  },
}

const offset = 6

function Tv() {
  const history = useHistory()
  const bigTvShowMatch = useRouteMatch<{ category: string; tvId: string }>(
    '/tv/:category/:tvId',
  )
  const { scrollY } = useViewportScroll()
  const { data: airingToday, isLoading: airingTodayLoading } = useQuery<
    IGetTvShowsResult
  >(['tv', 'airingToday'], getAiringTodayTvShows)
  const { data: popular, isLoading: popularLoading } = useQuery<
    IGetTvShowsResult
  >(['tv', 'popular'], getPopularTvShows)
  const { data: topRated, isLoading: topRatedLoading } = useQuery<
    IGetTvShowsResult
  >(['tv', 'topRated'], getTopRatedTvShows)
  const [airingTodayIndex, setAiringTodayIndex] = useState(0)
  const [popularIndex, setPopularIndex] = useState(0)
  const [topRatedIndex, setTopRatedIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [slideRight, setSlideRight] = useState(true)
  const increaseAiringTodayIndex = () => {
    if (airingToday) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = airingToday.results.length - 1
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setAiringTodayIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
      setSlideRight(true)
    }
  }
  const decreaseAiringTodayIndex = () => {
    if (airingToday) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = airingToday.results.length - 1
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setAiringTodayIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
      setSlideRight(false)
    }
  }
  const increasePopularIndex = () => {
    if (popular) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = popular.results.length
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setPopularIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
      setSlideRight(true)
    }
  }
  const decreasePopularIndex = () => {
    if (popular) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = popular.results.length
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setPopularIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
      setSlideRight(false)
    }
  }
  const increaseTopRatedIndex = () => {
    if (topRated) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = topRated.results.length
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setTopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
      setSlideRight(true)
    }
  }
  const decreaseTopRatedIndex = () => {
    if (topRated) {
      if (leaving) return
      toggleLeaving()
      const totalTvShows = topRated.results.length
      const maxIndex = Math.floor(totalTvShows / offset) - 1
      setTopRatedIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
      setSlideRight(false)
    }
  }
  const toggleLeaving = () => setLeaving((prev) => !prev)
  const onBoxClicked = (category: string, tvId: number) => {
    history.push(`/tv/${category}/${tvId}`)
  }
  const onOverlayClick = () => history.push('/tv')
  const clickedTvShow =
    bigTvShowMatch?.params.tvId &&
    ((bigTvShowMatch?.params.category === 'airingToday' &&
      airingToday?.results.find(
        (tvShow) => String(tvShow.id) === bigTvShowMatch.params.tvId,
      )) ||
      (bigTvShowMatch?.params.category === 'popular' &&
        popular?.results.find(
          (tvShow) => String(tvShow.id) === bigTvShowMatch.params.tvId,
        )) ||
      (bigTvShowMatch?.params.category === 'topRated' &&
        topRated?.results.find(
          (tvShow) => String(tvShow.id) === bigTvShowMatch.params.tvId,
        )))
  return (
    <Wrapper>
      {airingTodayLoading || popularLoading || topRatedLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(airingToday?.results[0].backdrop_path || '')}
          >
            <Title>{airingToday?.results[0].name}</Title>
            <Overview>{airingToday?.results[0].overview}</Overview>
          </Banner>
          <SliderCategory>
            <SliderTitle>
              <h2>Airing today</h2>
            </SliderTitle>
            <SliderButton>
              <button onClick={decreaseAiringTodayIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z" />
                </svg>
              </button>
              <button onClick={increaseAiringTodayIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z" />
                </svg>
              </button>
            </SliderButton>
            <Slider>
              <AnimatePresence
                custom={slideRight}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={slideRight}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={airingTodayIndex}
                >
                  {airingToday?.results
                    .slice(1)
                    .slice(
                      offset * airingTodayIndex,
                      offset * airingTodayIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'airingToday_' + tv.id}
                        key={tv.id}
                        variants={boxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: 'tween' }}
                        onClick={() => onBoxClicked('airingToday', tv.id)}
                        bgPhoto={makeImagePath(tv.backdrop_path || '', 'w500')}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </Slider>
          </SliderCategory>
          <SliderCategory>
            <SliderTitle>
              <h2>Popular</h2>
            </SliderTitle>
            <SliderButton>
              <button onClick={decreasePopularIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z" />
                </svg>
              </button>
              <button onClick={increasePopularIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z" />
                </svg>
              </button>
            </SliderButton>
            <Slider>
              <AnimatePresence
                custom={slideRight}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={slideRight}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={popularIndex}
                >
                  {popular?.results
                    .slice(
                      offset * popularIndex,
                      offset * popularIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'popular_' + tv.id}
                        key={tv.id}
                        variants={boxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: 'tween' }}
                        onClick={() => onBoxClicked('popular', tv.id)}
                        bgPhoto={makeImagePath(tv.backdrop_path || '', 'w500')}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </Slider>
          </SliderCategory>
          <SliderCategory>
            <SliderTitle>
              <h2>Top rated</h2>
            </SliderTitle>
            <SliderButton>
              <button onClick={decreaseTopRatedIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z" />
                </svg>
              </button>
              <button onClick={increaseTopRatedIndex}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z" />
                </svg>
              </button>
            </SliderButton>
            <Slider>
              <AnimatePresence
                custom={slideRight}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={slideRight}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'tween', duration: 1 }}
                  key={topRatedIndex}
                >
                  {topRated?.results
                    .slice(
                      offset * topRatedIndex,
                      offset * topRatedIndex + offset,
                    )
                    .map((tv) => (
                      <Box
                        layoutId={'topRated_' + tv.id}
                        key={tv.id}
                        variants={boxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: 'tween' }}
                        onClick={() => onBoxClicked('topRated', tv.id)}
                        bgPhoto={makeImagePath(tv.backdrop_path || '', 'w500')}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </Slider>
          </SliderCategory>
          <AnimatePresence>
            {bigTvShowMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                ></Overlay>
                <BigTvShow
                  layoutId={
                    bigTvShowMatch.params.category +
                    '_' +
                    bigTvShowMatch.params.tvId
                  }
                  style={{ top: scrollY.get() + 100 }}
                >
                  {clickedTvShow && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedTvShow.backdrop_path,
                            'w500',
                          )})`,
                        }}
                      />
                      <BigButtonBox>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM176 168V344C176 352.7 180.7 360.7 188.3 364.9C195.8 369.2 205.1 369 212.5 364.5L356.5 276.5C363.6 272.1 368 264.4 368 256C368 247.6 363.6 239.9 356.5 235.5L212.5 147.5C205.1 142.1 195.8 142.8 188.3 147.1C180.7 151.3 176 159.3 176 168V168z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M128 447.1V223.1c0-17.67-14.33-31.1-32-31.1H32c-17.67 0-32 14.33-32 31.1v223.1c0 17.67 14.33 31.1 32 31.1h64C113.7 479.1 128 465.6 128 447.1zM512 224.1c0-26.5-21.48-47.98-48-47.98h-146.5c22.77-37.91 34.52-80.88 34.52-96.02C352 56.52 333.5 32 302.5 32c-63.13 0-26.36 76.15-108.2 141.6L178 186.6C166.2 196.1 160.2 210 160.1 224c-.0234 .0234 0 0 0 0L160 384c0 15.1 7.113 29.33 19.2 38.39l34.14 25.59C241 468.8 274.7 480 309.3 480H368c26.52 0 48-21.47 48-47.98c0-3.635-.4805-7.143-1.246-10.55C434 415.2 448 397.4 448 376c0-9.148-2.697-17.61-7.139-24.88C463.1 347 480 327.5 480 304.1c0-12.5-4.893-23.78-12.72-32.32C492.2 270.1 512 249.5 512 224.1z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M96 32.04H32c-17.67 0-32 14.32-32 31.1v223.1c0 17.67 14.33 31.1 32 31.1h64c17.67 0 32-14.33 32-31.1V64.03C128 46.36 113.7 32.04 96 32.04zM467.3 240.2C475.1 231.7 480 220.4 480 207.9c0-23.47-16.87-42.92-39.14-47.09C445.3 153.6 448 145.1 448 135.1c0-21.32-14-39.18-33.25-45.43C415.5 87.12 416 83.61 416 79.98C416 53.47 394.5 32 368 32h-58.69c-34.61 0-68.28 11.22-95.97 31.98L179.2 89.57C167.1 98.63 160 112.9 160 127.1l.1074 160c0 0-.0234-.0234 0 0c.0703 13.99 6.123 27.94 17.91 37.36l16.3 13.03C276.2 403.9 239.4 480 302.5 480c30.96 0 49.47-24.52 49.47-48.11c0-15.15-11.76-58.12-34.52-96.02H464c26.52 0 48-21.47 48-47.98C512 262.5 492.2 241.9 467.3 240.2z" />
                        </svg>
                      </BigButtonBox>
                      <BigTitle>{clickedTvShow.name}</BigTitle>
                      <BigOverview>{clickedTvShow.overview}</BigOverview>
                      <BigInfo>
                        <span>
                          First air date : {clickedTvShow.first_air_date}
                        </span>
                        <span>Rating : {clickedTvShow.vote_average}</span>
                      </BigInfo>
                    </>
                  )}
                </BigTvShow>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  )
}

export default Tv
