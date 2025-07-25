import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import StoryGenerator from './components/StoryGenerator';
import StoryHistory from './components/StoryHistory';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<StoryGenerator />} />
            <Route path="/history" element={<StoryHistory />} />
          </Routes>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;