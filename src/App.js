import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 引入页面组件
import Home from './pages/HomePage';
import Map from './pages/MapPage';
import Test from "./pages/TestPage";

function App() {
  return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
  );
}


export default App;

