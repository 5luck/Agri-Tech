import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../features/auth/AuthContext';
import api from '../../lib/apiClient';

export const AppLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/farms')
        .then((res) => {
          const farmList = res.data || [];
          setFarms(farmList);
          if (farmList.length > 0) {
            setSelectedFarm(farmList[0]);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading Agri-Tech platform...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header
          farms={farms}
          selectedFarm={selectedFarm}
          onSelectFarm={setSelectedFarm}
        />
        <main className="page-wrapper">
          <Outlet context={{ farms, selectedFarm, setSelectedFarm, refreshFarms: () => {
            api.get('/farms').then((res) => setFarms(res.data || []));
          } }} />
        </main>
      </div>
    </div>
  );
};
