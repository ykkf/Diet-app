import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Meals from './pages/Meals';
import Weight from './pages/Weight';
import Foods from './pages/Foods';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
import { useAppContext } from './contexts/AppContext';

function App() {
  const { activeUserId, isLoading } = useAppContext();

  if (isLoading) {
    return <div className="app-container flex items-center justify-center">Loading...</div>;
  }

  return (
    <HashRouter>
      {activeUserId ? (
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/weight" element={<Weight />} />
            <Route path="/foods" element={<Foods />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}

export default App;
