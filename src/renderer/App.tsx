import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Provider } from 'react-redux';
import store from './store';
import ContextSwitcher from './pages/ContextSwitcher';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<ContextSwitcher />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </Provider>
  );
}
