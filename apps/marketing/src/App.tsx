import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import {
  HomePage,
  FeaturesPage,
  PricingPage,
  AboutPage,
  ContactPage,
  BlogPage,
  CaseStudiesPage,
  DocsPage,
  TermsPage,
  PrivacyPage,
  NotFoundPage,
} from './routes';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Marketing */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Resources */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />

        {/* Developer Portal */}
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:section" element={<DocsPage />} />

        {/* Legal */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
