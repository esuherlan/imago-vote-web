import { Routes, Route } from 'react-router-dom';
import VotePage from './pages/VotePage.jsx';
import Shell from './components/Shell.jsx';
import Message from './components/Message.jsx';

const Fallback = () => (
  <Shell>
    <Message tone="qr" title="Scan the QR code" text="Point your phone camera at the QR code on the smartboard to start voting." />
  </Shell>
);

export default function App() {
  return (
    <Routes>
      <Route path="/v/:code" element={<VotePage />} />
      <Route path="*" element={<Fallback />} />
    </Routes>
  );
}
