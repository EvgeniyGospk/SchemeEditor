import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import EditorScreen from "./components/editor/EditorScreen";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<WelcomeScreen />} />

        {}
        <Route path="/editor" element={<EditorScreen />} />

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
