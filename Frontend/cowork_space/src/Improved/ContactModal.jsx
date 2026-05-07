import React, { useState } from "react";
import axiosInstance from "../Services/Axios";
import "./ContactModal.css";
import Reveal from "../Pages/Reveal";

const ContactModal = ({
  selected,
  setSelected,
}) => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    team_size: "",
    message: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axiosInstance.post(
        "leads/leadss/",
        {

          ...form,

          workspace_type:
            selected?.type,

          preferred_location:
            selected?.area,

          offer_workspace:
            selected?.workspace_name ||
            selected?.building,
        }
      );

      alert(
        "✅ Lead submitted successfully!"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        team_size: "",
        message: "",
      });

      setSelected(null);

    } catch (error) {

      console.log(error);

      alert(
        "❌ Error submitting form"
      );
    }
  };

  if (!selected) return null;

  return (

    <div className="cmModalOverlay">

      <div className="cmBackgroundGlow cmGlowOne"></div>

      <div className="cmBackgroundGlow cmGlowTwo"></div>

      <div className="cmBackgroundGrid"></div>

      <Reveal>

        <button
          className="cmBackButton"
          onClick={() =>
            setSelected(null)
          }
        >
          <span>←</span> Back
        </button>

      </Reveal>

      <div className="cmModalShell">

        {/* LEFT SIDE */}

        <div className="cmInfoPanel">

          <Reveal>
            <p className="cmMiniTag">
              Contact
            </p>
          </Reveal>

          <Reveal>
            <h2 className="cmTitle">
              Get in Touch
            </h2>
          </Reveal>

          <Reveal>

            <p className="cmDescription">

              Reach out to us to
              explore workspace
              options tailored for
              your business and
              team size.

            </p>

          </Reveal>

          <div className="cmInfoList">

            <Reveal>

              <div className="cmInfoItem">

                <span className="cmInfoIcon">
                  📍
                </span>

                <p>
                  {
                    selected?.area
                  }
                </p>

              </div>

            </Reveal>

            <Reveal>

              <div className="cmInfoItem">

                <span className="cmInfoIcon">
                  🏢
                </span>

                <p>
                  {
                    selected?.workspace_name ||
                    selected?.building
                  }
                </p>

              </div>

            </Reveal>

            <Reveal>

              <div className="cmInfoItem">

                <span className="cmInfoIcon">
                  💺
                </span>

                <p>
                  {
                    selected?.type
                  }
                </p>

              </div>

            </Reveal>

          </div>

          <Reveal>

            <div className="cmSelectedBadge">

              <span className="cmSelectedLabel">
                Selected Workspace
              </span>

              <strong>

                {
                  selected?.workspace_name ||
                  selected?.building
                }

              </strong>

              <small>
                {
                  selected?.area
                }
              </small>

            </div>

          </Reveal>

        </div>

        {/* RIGHT SIDE */}

        <div className="cmFormPanel">

          <Reveal>

            <h3 className="cmFormTitle">
              Send a Message
            </h3>

          </Reveal>

          <form
            className="cmForm"
            onSubmit={
              handleSubmit
            }
          >

            {/* LOCATION */}

            <div className="cmFieldGroup">

              <label>
                Preferred Location
              </label>

              <Reveal>

                <input
                  type="text"
                  value={
                    selected?.area || ""
                  }
                  readOnly
                />

              </Reveal>

            </div>

            {/* WORKSPACE */}
<div className="cmFieldGroup">

  <label>
    Workspace
  </label>

  <Reveal>

    <input
      type="text"
      value={
        selected?.type || ""
      }
      readOnly
    />

  </Reveal>

</div>

            {/* NAME */}

            <div className="cmFieldGroup">

              <label>
                Name *
              </label>

              <Reveal>

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                />

              </Reveal>

            </div>

            {/* EMAIL */}

            <div className="cmFieldGroup">

              <label>
                Email *
              </label>

              <Reveal>

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  required
                />

              </Reveal>

            </div>

            {/* PHONE */}

            <div className="cmFieldGroup">

              <label>
                Phone *
              </label>

              <Reveal>

                <input
                  type="text"
                  name="phone"
                  placeholder="Mobile Number"
                  value={form.phone}
                  onChange={
                    handleChange
                  }
                  required
                />

              </Reveal>

            </div>

            {/* TEAM SIZE */}

            <div className="cmFieldGroup">

              <label>
                Team Size *
              </label>

              <Reveal>

                <select
                  name="team_size"
                  value={
                    form.team_size
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select
                  </option>

                  <option>
                    1-3
                  </option>

                  <option>
                    4-6
                  </option>

                  <option>
                    6-10
                  </option>

                  <option>
                    10+
                  </option>

                </select>

              </Reveal>

            </div>

            {/* MESSAGE */}

            <div className="cmFieldGroup cmFieldFull">

              <label>
                Message
              </label>

              <Reveal>

                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={
                    form.message
                  }
                  onChange={
                    handleChange
                  }
                />

              </Reveal>

            </div>

            <Reveal>

              <button
                type="submit"
                className="cmSubmitButton"
              >
                Submit Enquiry
              </button>

            </Reveal>

          </form>

        </div>

      </div>

    </div>
  );
};

export default ContactModal;