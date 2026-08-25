import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import SEO from "../components/SEO";

import "../styles/legal-page.css";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <main className="legal-page page-safe">
      <SEO
        title="Privacy Policy | MyRaagam"
        description="Learn how MyRaagam handles account, music library, feedback, and usage information."
        robots="index, follow"
      />

      <header className="legal-header">
        <button
          type="button"
          className="legal-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IoChevronBack />
        </button>

        <h1>Privacy Policy</h1>
      </header>

      <article className="legal-content">
        <p className="legal-updated">Last updated: August 25, 2026</p>

        <p>
          Welcome to MyRaagam. We respect your privacy and want you to
          understand what information is used when you use our music
          application.
        </p>

        <section>
          <h2>1. Information We Collect</h2>

          <p>
            When you create or use an account, MyRaagam may receive information
            associated with your account, such as your email address and
            account identifier.
          </p>

          <p>
            If you choose to add or update a display name, that information may
            also be stored as part of your profile.
          </p>
        </section>

        <section>
          <h2>2. Your Music Library</h2>

          <p>
            MyRaagam may store information related to your use of the
            application, including liked songs and playlists, so that these
            features can work across your account.
          </p>
        </section>

        <section>
          <h2>3. Feedback and Messages</h2>

          <p>
            If you use our Help & Feedback feature, the message you submit may
            be stored together with information associated with your account,
            such as your email address, feedback type, and the page from which
            the feedback was submitted.
          </p>

          <p>
            We use this information to understand problems, requests, and
            suggestions and to improve MyRaagam.
          </p>
        </section>

        <section>
          <h2>4. Offline Music</h2>

          <p>
            When you use the offline feature, audio data may be stored locally
            in your browser on your device.
          </p>

          <p>
            Removing offline songs removes the locally stored offline copies.
            It does not remove your liked songs or playlists from your account.
          </p>
        </section>

        <section>
          <h2>5. How We Use Information</h2>

          <p>Information may be used to:</p>

          <ul>
            <li>Provide and maintain MyRaagam features.</li>
            <li>Manage user accounts and profiles.</li>
            <li>Maintain liked songs and playlists.</li>
            <li>Respond to feedback and reported problems.</li>
            <li>Understand how the application is used and improve it.</li>
            <li>Maintain the security and reliability of the service.</li>
          </ul>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>

          <p>
            MyRaagam uses third-party services to provide certain application
            functionality, including authentication, database storage, and
            analytics.
          </p>

          <p>
            These services may process information according to their own
            privacy policies and terms.
          </p>
        </section>

        <section>
          <h2>7. Cookies and Local Storage</h2>

          <p>
            MyRaagam may use browser storage technologies such as local storage
            and IndexedDB to maintain application state and support features
            such as offline music.
          </p>
        </section>

        <section>
          <h2>8. Data Security</h2>

          <p>
            We take reasonable measures to protect information used by the
            application. However, no internet service or electronic storage
            system can be guaranteed to be completely secure.
          </p>
        </section>

        <section>
          <h2>9. Your Choices</h2>

          <p>
            You can update information such as your display name through your
            account settings. You can also remove locally stored offline music
            through the Offline section of MyRaagam.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy from time to time as MyRaagam
            develops. When changes are made, the updated version will be
            published on this page.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>

          <p>
            If you have questions about this Privacy Policy or how your
            information is handled, please contact us through the Help &
            Feedback section of MyRaagam.
          </p>
        </section>
      </article>
    </main>
  );
}