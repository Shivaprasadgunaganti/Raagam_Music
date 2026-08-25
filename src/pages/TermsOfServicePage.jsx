import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import SEO from "../components/SEO";

import "../styles/legal-page.css";

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <main className="legal-page page-safe">
      <SEO
        title="Terms of Service | MyRaagam"
        description="Read the terms that apply when using the MyRaagam music application."
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

        <h1>Terms of Service</h1>
      </header>

      <article className="legal-content">
        <p className="legal-updated">Last updated: August 25, 2026</p>

        <p>
          These Terms of Service describe the general terms for using
          MyRaagam. By accessing or using MyRaagam, you agree to use the
          service responsibly and in accordance with these terms.
        </p>

        <section>
          <h2>1. Using MyRaagam</h2>

          <p>
            MyRaagam provides music discovery, playback, library, playlist,
            liked-song, and related features. Features may change or be
            improved over time.
          </p>
        </section>

        <section>
          <h2>2. Your Account</h2>

          <p>
            If you create an account, you are responsible for maintaining the
            security of your account and for activity performed through it.
          </p>

          <p>
            You should provide accurate information and should not use another
            person's account without permission.
          </p>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>

          <p>You agree not to:</p>

          <ul>
            <li>Use MyRaagam for unlawful purposes.</li>
            <li>Attempt to gain unauthorized access to the service.</li>
            <li>Interfere with the operation or security of the application.</li>
            <li>Abuse, exploit, or intentionally disrupt application features.</li>
            <li>Use the service in a way that violates applicable laws.</li>
          </ul>
        </section>

        <section>
          <h2>4. Music and Content</h2>

          <p>
            Music and other content available through MyRaagam may be provided
            through sources and services that have their own rights and
            licensing arrangements.
          </p>

          <p>
            Your use of music and other content is subject to the applicable
            rights, licenses, and restrictions associated with that content.
          </p>
        </section>

        <section>
          <h2>5. Offline Feature</h2>

          <p>
            MyRaagam may provide an offline feature that stores supported audio
            data locally on your device.
          </p>

          <p>
            Offline availability may depend on the browser, device, available
            storage, and the continued availability of the underlying content.
          </p>
        </section>

        <section>
          <h2>6. User Feedback</h2>

          <p>
            You may submit bug reports, feature suggestions, song requests, or
            other feedback through MyRaagam.
          </p>

          <p>
            Please do not submit confidential, sensitive, or unlawful
            information through the feedback feature.
          </p>
        </section>

        <section>
          <h2>7. Availability</h2>

          <p>
            We aim to keep MyRaagam available and reliable, but we do not
            guarantee that the service will always be available, uninterrupted,
            or error-free.
          </p>
        </section>

        <section>
          <h2>8. Changes to the Service</h2>

          <p>
            We may add, modify, suspend, or remove features as MyRaagam
            develops. We may also update these Terms when necessary.
          </p>
        </section>

        <section>
          <h2>9. Account Termination</h2>

          <p>
            Access to MyRaagam may be restricted or terminated if an account is
            used in violation of these terms or in a way that may harm the
            service or other users.
          </p>
        </section>

        <section>
          <h2>10. Disclaimer</h2>

          <p>
            MyRaagam is provided on an "as available" basis. To the extent
            permitted by applicable law, we make no guarantee that the service
            will meet every user's particular requirements or remain free from
            interruptions or errors.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>

          <p>
            If you have questions about these Terms of Service, please contact
            us through the Help & Feedback section of MyRaagam.
          </p>
        </section>
      </article>
    </main>
  );
}