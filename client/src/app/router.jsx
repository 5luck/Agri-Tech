import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { RouteErrorBoundary } from '../components/feedback/RouteErrorBoundary';

import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';

import { FarmerDashboard } from '../features/dashboard/FarmerDashboard';
import { FarmListPage } from '../features/farms/FarmListPage';
import { CropListPage } from '../features/crops/CropListPage';
import { SoilDashboardPage } from '../features/soil/SoilDashboardPage';
import { WeatherForecastPage } from '../features/weather/WeatherForecastPage';
import { AlertsListPage } from '../features/alerts/AlertsListPage';
import { MarketplacePage } from '../features/marketplace/MarketplacePage';
import { OrdersListPage } from '../features/orders/OrdersListPage';
import { ConsultationListPage } from '../features/consultations/ConsultationListPage';
import { CommunityForumPage } from '../features/community/CommunityForumPage';
import { AdminDashboard } from '../features/admin/AdminDashboard';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> }
    ]
  },
  // Protected platform application routes
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'dashboard', element: <FarmerDashboard /> },
      { path: 'farms', element: <FarmListPage /> },
      { path: 'crops', element: <CropListPage /> },
      { path: 'soil', element: <SoilDashboardPage /> },
      { path: 'weather', element: <WeatherForecastPage /> },
      { path: 'alerts', element: <AlertsListPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'consultations', element: <ConsultationListPage /> },
      { path: 'community', element: <CommunityForumPage /> },
      { path: 'admin', element: <AdminDashboard /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
