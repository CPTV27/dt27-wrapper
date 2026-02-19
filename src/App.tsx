/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { BrandSelector } from './components/BrandSelector';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Ecosystem } from './pages/Ecosystem';
import { Revenue } from './pages/Revenue';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Knowledge } from './pages/Knowledge';

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <Router>
          <Routes>
            <Route path="/" element={<BrandSelector />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="ecosystem" element={<Ecosystem />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </TaskProvider>
    </ThemeProvider>
  );
}
