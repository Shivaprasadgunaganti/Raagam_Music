import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBack, IoCheckmarkCircle } from "react-icons/io5";
import {
  MdBugReport,
  MdLightbulbOutline,
  MdMusicNote,
  MdFavoriteBorder,
  MdChatBubbleOutline,
} from "react-icons/md";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabaseClient";

import "../styles/feedback.css";

const feedbackTypes = [
  {
    value: "bug",
    label: "Report a problem",
    icon: <MdBugReport />,
  },
  {
    value: "feature",
    label: "Suggest a feature",
    icon: <MdLightbulbOutline />,
  },
  {
    value: "song_request",
    label: "Request a song",
    icon: <MdMusicNote />,
  },
  {
    value: "feedback",
    label: "Share feedback",
    icon: <MdFavoriteBorder />,
  },
  {
    value: "other",
    label: "Something else",
    icon: <MdChatBubbleOutline />,
  },
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      showToast("Please enter your message.");
      return;
    }

    if (trimmedMessage.length < 5) {
      showToast("Please provide a little more detail.");
      return;
    }

    if (!user?.id) {
      showToast("Please sign in to send feedback.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        email: user.email || null,
        type,
        message: trimmedMessage,
        page: location.state?.from || "feedback",
      });

      if (error) {
        console.error("Feedback submission error:", error);
        showToast("Couldn't send feedback. Please try again.");
        return;
      }

      setSubmitted(true);
      setMessage("");
    } catch (error) {
      console.error("Feedback submission error:", error);
      showToast("Couldn't send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="feedback-page page-safe">
        <header className="feedback-header">
          <button
            type="button"
            className="feedback-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IoChevronBack />
          </button>

          <h1>Help & Feedback</h1>
        </header>

        <section className="feedback-success">
          <IoCheckmarkCircle className="feedback-success-icon" />

          <h2>Thanks for helping us improve Raagam ❤️</h2>

          <p>
            Your message has been received. We really appreciate you taking the
            time to share it with us.
          </p>

          <button
            type="button"
            className="feedback-done-btn"
            onClick={() => navigate(-1)}
          >
            Done
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="feedback-page page-safe">
      <header className="feedback-header">
        <button
          type="button"
          className="feedback-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IoChevronBack />
        </button>

        <h1>Help & Feedback</h1>
      </header>

      <section className="feedback-intro">
        <h2>How can we help?</h2>

        <p>
          Tell us what you're thinking. Report a problem, request a feature, or
          simply share your feedback.
        </p>
      </section>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="feedback-field">
          <label>What would you like to tell us?</label>

          <div className="feedback-type-list">
            {feedbackTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`feedback-type ${
                  type === item.value ? "active" : ""
                }`}
                onClick={() => setType(item.value)}
              >
                <span className="feedback-type-icon">{item.icon}</span>

                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-field">
          <label htmlFor="feedback-message">Message</label>

          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's happening..."
            maxLength={1000}
            rows={6}
            disabled={submitting}
          />

          <div className="feedback-counter">{message.length}/1000</div>
        </div>

        <p className="feedback-account-note">
          We'll associate this feedback with your Raagam account.
        </p>

        <button
          type="submit"
          className="feedback-submit-btn"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </main>
  );
}
