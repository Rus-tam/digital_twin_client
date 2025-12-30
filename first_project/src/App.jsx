import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

import ModelSelectionPage from "./pages/ModelSelectionPage";
import MappingTablePage from "./pages/MappingTablePage";
import LabResearchPage from "./pages/LabResearchPage";
import ProcessSchemePage from "./pages/ProcessSchemaPage";

export default function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [mappingData, setMappingData] = useState([]);

  return (
    <>
      <Header selectedModel={selectedModel} />
      
      <main style={{ 
        marginBottom: "60px", 
        minHeight: "calc(100vh - 48px - 60px)" 
      }}>
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
                ? <MappingTablePage 
                    mappingData={mappingData} 
                    onMappingDataChange={setMappingData} 
                  />
                : <Navigate to="/" replace />
            }
          />

          <Route
            path="/lab-research"
            element={<LabResearchPage />}
          />

          <Route
            path="/schema"
            element={<ProcessSchemePage/>}
           />

        </Routes>
      </main>
      
      <Footer />
    </>
  );
}