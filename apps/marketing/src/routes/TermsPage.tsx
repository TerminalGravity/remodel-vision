import { Helmet } from 'react-helmet-async';

export const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - RemodelVision</title>
        <meta name="description" content="Terms of Service for RemodelVision platform." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: December 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using RemodelVision ("Service"), you agree to be bound by these Terms of Service
              ("Terms"). If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed">
              RemodelVision provides an AI-powered platform for home design visualization, property intelligence,
              and renovation planning. The Service includes web-based tools, APIs, SDKs, and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information.
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or interfere with the Service</li>
              <li>Collect user data without consent</li>
              <li>Engage in any activity that harms the Service or its users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service and its original content, features, and functionality are owned by RemodelVision
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws. Your use of the Service grants you no rights to our intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. User Content</h2>
            <p className="text-slate-300 leading-relaxed">
              You retain ownership of content you upload to the Service. By uploading content, you grant us
              a non-exclusive, worldwide, royalty-free license to use, modify, and display your content solely
              for the purpose of providing the Service. We may also use anonymized, aggregated data for
              improving our AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Subscription and Payment</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Some features require a paid subscription. By subscribing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>You authorize us to charge your payment method on a recurring basis</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are available within 14 days of initial purchase</li>
              <li>We may change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, RemodelVision shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits, data,
              or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind. We do not
              guarantee that the Service will be uninterrupted, secure, or error-free. AI-generated designs
              and cost estimates are for informational purposes only and should not be relied upon for
              final construction decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for conduct that we
              believe violates these Terms or is harmful to other users, us, or third parties, or for any
              other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes
              by posting the new Terms on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@remodelvision.app" className="text-blue-400 hover:text-blue-300">
                legal@remodelvision.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
};
