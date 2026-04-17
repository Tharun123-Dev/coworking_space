import styles from "../Styles/Testimonials.module.css";

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Aarav Mehta",
      role: "Startup Founder",
      company: "NextScale",
      city: "Hyderabad",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "CoWork helped our team move into a professional setup without the stress of long-term leases. The ambience, meeting rooms, and support staff are all excellent.",
    },
    {
      id: 2,
      name: "Sneha Reddy",
      role: "UI/UX Designer",
      company: "Freelancer",
      city: "Madhapur",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "I love the calm environment and premium interiors. It feels inspiring every day, and the internet speed plus flexible seating made my workflow much smoother.",
    },
    {
      id: 3,
      name: "Rahul Sharma",
      role: "Product Manager",
      company: "CloudBridge",
      city: "Hitech-city",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "The best part is the community. You get networking, comfort, and productivity in one place. Our client meetings became much more professional after joining.",
    },
    {
      id: 4,
      name: "Priya Nair",
      role: "Marketing Consultant",
      company: "BrandOrbit",
      city: "Hyderabad",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "From the front desk support to the conference spaces, everything feels thoughtfully designed. It gives clients a premium impression and helps me work with focus.",
    },
    {
      id: 5,
      name: "Kiran Verma",
      role: "Remote Developer",
      company: "TechNova",
      city: "Wipro Circle",
      image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "I used to struggle working from home, but this workspace gave me structure and energy. The flexible plans and modern setup make it ideal for remote professionals.",
    },
    {
      id: 6,
      name: "Ananya Kapoor",
      role: "Business Owner",
      company: "Studio Lane",
      city: "Durgam Cheruvu",
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
      rating: 5,
      text: "Beautiful interiors, clean amenities, and a great work vibe. It feels more like a business community than just a rented desk, and that makes a huge difference.",
    },
  ];

  const loopTestimonials = [...testimonials, ...testimonials];

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.topContent}>
          <p className={styles.badge}>Testimonials</p>
          <h2 className={styles.heading}>What our members say about CoWork</h2>
          <p className={styles.subText}>
            Discover why founders, freelancers, and growing teams choose our
            coworking spaces for productivity, comfort, and a strong
            professional community.
          </p>
        </div>

        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {loopTestimonials.map((item, index) => (
              <div className={styles.card} key={`${item.id}-${index}`}>
                <div className={styles.cardTop}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.avatar}
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p className={styles.role}>
                      {item.role} • {item.company}
                    </p>
                    <span className={styles.city}>{item.city}</span>
                  </div>
                </div>

                <div className={styles.stars}>
                  {"★".repeat(item.rating)}
                </div>

                <p className={styles.message}>“{item.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;