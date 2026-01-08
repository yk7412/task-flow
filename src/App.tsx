import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.less'
import NavigationMenu from './components/NavigationMenu'
import Home from './pages/Home'
import MaterialLibrary from './pages/MaterialLibrary'
import WeeklyReportTool from './pages/WeeklyReportTool'

const App = () => {
  return <div className="App">
    <BrowserRouter>
      <div className="task-flow-header">
        <h1 style={{ margin: 0 }} >TaskFlow</h1>
      </div>
      <div className="task-flow-content">
        <div className="task-flow-content-left">
          <NavigationMenu />
        </div>
        <div className="task-flow-content-right">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/material-library' element={<MaterialLibrary />} />
            <Route path='/weekly-report-tool' element={<WeeklyReportTool />} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  </div>
}

export default App
