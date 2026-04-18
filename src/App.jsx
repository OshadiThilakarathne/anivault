import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Library from './pages/Library/Library'
import Search from './pages/Search/Search'
import Stats from './pages/Stats/Stats'
import AnimeDetail from './pages/AnimeDetail/AnimeDetail'
import Layout from './components/Layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="library" element={<Library />} />
          <Route path="search" element={<Search />} />
          <Route path="stats" element={<Stats />} />
          <Route path="anime/:id" element={<AnimeDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App