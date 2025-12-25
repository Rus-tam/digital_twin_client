import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

import ModelSelectionPage from "./pages/ModelSelectionPage";
import MappingTablePage from "./pages/MappingTablePage";

export default function App() {
  const [selectedModel, setSelectedModel] = useState(null);

  return (
    <>
      <Header selectedModel={selectedModel} />

      <Routes>
        <Route
          path="/"
          element={
            <ModelSelectionPage
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          }
        />

        <Route
          path="/mapping"
          element={
            selectedModel
              ? <MappingTablePage />
              : <Navigate to="/" replace />
          }
        />

      </Routes>
    </>
  );
}
