import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
  InjectionsPage,
  WeightPage,
  MusclePage,
  LevelsPage,
  PhotosPage,
  AnalyticsPage,
  ReportPage,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<InjectionsPage />} />
          <Route path="weight" element={<WeightPage />} />
          <Route path="muscle" element={<MusclePage />} />
          <Route path="levels" element={<LevelsPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
