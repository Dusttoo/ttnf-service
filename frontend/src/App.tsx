import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';


const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<PrivateRoutes />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;