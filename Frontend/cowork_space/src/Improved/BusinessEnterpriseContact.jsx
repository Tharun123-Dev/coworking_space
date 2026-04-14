import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "./BusinessEnterpriseContact.css";

function BusinessEnterpriseContact() {
  const { name } = useParams();

  const initialForm = useMemo(
    () => ({
      location: name || "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      team_size: "",
      move_in_date: "",
      budget: "",
      requirement: "",
    }),
    [name]
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setStatus({
      type: "",
      message: "",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.company_name.trim()) {
      newErrors.company_name = "Company name is required.";
    }

    if (!form.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (!form.team_size.trim()) {
      newErrors.team_size = "Team size is required.";
    }

    if (!form.move_in_date.trim()) {
      newErrors.move_in_date = "Preferred move-in date is required.";
    }

    if (!form.budget.trim()) {
      newErrors.budget = "Budget is required.";
    }

    if (!form.requirement.trim()) {
      newErrors.requirement = "Please describe your workspace requirement.";
    }

    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields before submitting.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ type: "", message: "" });

      await axiosInstance.post("leads/business/add/", form);

      setStatus({
        type: "success",
        message:
          "Your enterprise booking request has been submitted successfully. Our team will contact you soon.",
      });

      setForm({
        ...initialForm,
        location: name || "",
      });
      setErrors({});
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Something went wrong while submitting your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="enterprise-page">
      <div className="enterprise-shell">
        <div className="enterprise-left">
          <span className="enterprise-badge">Enterprise Booking</span>
          <h1>Book a custom workspace in {name}</h1>
          <p className="enterprise-subtext">
            Tell us about your company, team size, move-in plan, and workspace
            requirements. We will prepare a tailored coworking solution for your
            business.
          </p>

          <div className="enterprise-highlights">
            <div className="highlight-card">
              <h3>Custom office plans</h3>
              <p>Flexible seating, cabins, team rooms, and managed spaces.</p>
            </div>
            <div className="highlight-card">
              <h3>Fast response</h3>
              <p>Our enterprise team reviews requests and gets back quickly.</p>
            </div>
            <div className="highlight-card">
              <h3>Scalable solutions</h3>
              <p>Perfect for startups, distributed teams, and growing companies.</p>
            </div>
          </div>
        </div>

        <div className="enterprise-form-card">
          <form className="enterprise-form" onSubmit={submit} noValidate>
            <div className="form-header">
              <h2>Enterprise Contact Form</h2>
              <p>Share your details and we’ll arrange the right workspace plan.</p>
            </div>

            {status.message && (
              <div
                className={`form-status ${
                  status.type === "success" ? "success" : "error"
                }`}
                role="alert"
              >
                {status.message}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="location">Preferred Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_name">
                  Company Name <span>*</span>
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Enter company name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={errors.company_name ? "input-error" : ""}
                />
                {errors.company_name && (
                  <small className="error-text">{errors.company_name}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contact_person">
                  Contact Person <span>*</span>
                </label>
                <input
                  id="contact_person"
                  name="contact_person"
                  type="text"
                  placeholder="Enter contact person name"
                  value={form.contact_person}
                  onChange={handleChange}
                  className={errors.contact_person ? "input-error" : ""}
                />
                {errors.contact_person && (
                  <small className="error-text">{errors.contact_person}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Business Email <span>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <small className="error-text">{errors.email}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span>*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? "input-error" : ""}
                />
                {errors.phone && (
                  <small className="error-text">{errors.phone}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="team_size">
                  Team Size <span>*</span>
                </label>
                <input
                  id="team_size"
                  name="team_size"
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={form.team_size}
                  onChange={handleChange}
                  className={errors.team_size ? "input-error" : ""}
                />
                {errors.team_size && (
                  <small className="error-text">{errors.team_size}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="move_in_date">
                  Move-in Date <span>*</span>
                </label>
                <input
                  id="move_in_date"
                  name="move_in_date"
                  type="date"
                  value={form.move_in_date}
                  onChange={handleChange}
                  className={errors.move_in_date ? "input-error" : ""}
                />
                {errors.move_in_date && (
                  <small className="error-text">{errors.move_in_date}</small>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="budget">
                  Budget <span>*</span>
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder="e.g. ₹1,50,000 / month"
                  value={form.budget}
                  onChange={handleChange}
                  className={errors.budget ? "input-error" : ""}
                />
                {errors.budget && (
                  <small className="error-text">{errors.budget}</small>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirement">
                  Workspace Requirement <span>*</span>
                </label>
                <textarea
                  id="requirement"
                  name="requirement"
                  rows="5"
                  placeholder="Tell us about cabin requirements, private office needs, meeting rooms, amenities, contract duration, and any custom setup."
                  value={form.requirement}
                  onChange={handleChange}
                  className={errors.requirement ? "input-error" : ""}
                />
                {errors.requirement && (
                  <small className="error-text">{errors.requirement}</small>
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Enterprise Request"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default BusinessEnterpriseContact;