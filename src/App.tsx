import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Header from './Components/Header'
import Home from './Routes/Home'
import Search from './Routes/Search'
import Tv from './Routes/Tv'

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/tv">
          <Tv />
        </Route>
        <Route path={['/search', '/search/:id']}>
          <Search />
        </Route>
        <Route path={['/', '/movie/:category/:movieId']}>
          <Home />
        </Route>
        <Route path="/tv/:category/:tvId">
          <Tv />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
