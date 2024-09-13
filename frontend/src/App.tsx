import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme/theme";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/admin/*" element={<PrivateRoutes />} />
              <Route path="/*" element={<PublicRoutes />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </Suspense>
  );
};

export default App;