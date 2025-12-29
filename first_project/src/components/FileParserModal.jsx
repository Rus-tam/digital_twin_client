import React, { useState, useRef } from "react";

const FileParserModal = ({ isOpen, onClose, onParse, selectedParameter }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsingStatus, setParsingStatus] = useState("idle");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    const fileInfo = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      uploadDate: new Date().toLocaleString('ru-RU'),
      file: file
    };
    
    setUploadedFiles(prev => [...prev, fileInfo]);
    setSelectedFile(fileInfo);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
    e.target.value = '';
  };

  const handleParseFile = () => {
    if (!selectedFile) {
      alert("Выберите файл для загрузки");
      return;
    }

    setParsingStatus("parsing");
    
    setTimeout(() => {
      const mockParsedData = {
        value: Math.random() * 100,
        unit: selectedParameter?.unit || "",
        fileName: selectedFile.name,
        analysisDate: new Date().toISOString(),
        labName: "Лаборатория из файла",
        method: "Анализ из файла",
        notes: `Данные из файла: ${selectedFile.name}`
      };

      onParse(mockParsedData);
      setParsingStatus("idle");
    }, 1000);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal file-upload-modal">
        <div className="modal-header">
          <h2>Загрузка результатов из файла</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {selectedParameter && (
            <div className="parameter-display">
              <div className="param-label">Параметр:</div>
              <div className="param-name">{selectedParameter.parameterName}</div>
            </div>
          )}

          <div 
            className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <h3>Перетащите файл сюда или нажмите для выбора</h3>
            <p className="upload-hint">
              Поддерживаемые форматы: PDF, XLSX, XLS
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="file-input-hidden"
              onChange={handleFileSelect}
              accept=".pdf,.xlsx,.xls,.csv"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-section">
              <h4>Загруженные файлы ({uploadedFiles.length})</h4>
              {uploadedFiles.map(file => (
                <div 
                  key={file.id} 
                  className={`file-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="file-info">
                    <div className="file-icon">
                      {file.type.includes('pdf') ? '📄' : '📊'}
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {file.size} MB • {file.uploadDate}
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    {selectedFile?.id === file.id && (
                      <button
                        className="primary-btn btn-sm"
                        onClick={handleParseFile}
                        disabled={parsingStatus === "parsing"}
                      >
                        {parsingStatus === "parsing" ? "Обработка..." : "Использовать"}
                      </button>
                    )}
                    <button
                      className="danger-btn btn-sm"
                      onClick={() => removeFile(file.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {parsingStatus === "parsing" && (
            <div className="parsing-status">
              <div className="parsing-icon">⏳</div>
              <h3>Обработка файла...</h3>
              <p>Извлечение данных из файла</p>
            </div>
          )}

          <div className="modal-footer">
            <div className="selected-file-info">
              {selectedFile 
                ? `Выбран файл: ${selectedFile.name}`
                : "Файл не выбран"}
            </div>
            <button className="secondary-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileParserModal;