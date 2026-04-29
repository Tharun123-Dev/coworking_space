import { useEffect, useState } from "react";
import styles from "../Styles/Testimonials.module.css";

const testimonials = [
  { id:1,  name:"Akhil R",    role:"Startup Founder",      company:"NextScale",  city:"Hyderabad",    img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", rating:5, text:"CoWork stood out from the rest. Reliable Wi-Fi, vibrant networking events — everything supports productivity. Highly recommended for small teams seeking flexibility and inspiration." },
  { id:2,  name:"Sathya K",   role:"Product Manager",      company:"CloudBridge", city:"Hitech City",  img:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", rating:4, text:"Working from home was draining me. CoWork gave me structure and freedom. Great coffee, natural light, and a community vibe that shifts your entire mindset." },
  { id:3,  name:"Sekher J",   role:"Marketing Consultant", company:"BrandOrbit", city:"Madhapur",     img:"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&q=80", rating:5, text:"What sets CoWork apart is the people. I've met collaborators, clients, and friends here organically. Beautiful interiors and super functional layout." },
  { id:4,  name:"Priya M",    role:"Freelance Designer",   company:"Studio P",   city:"Banjara Hills",img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating:5, text:"As a freelancer, I needed a space that felt like home but kept me professional. CoWork nailed it — quiet zones, fast internet, and warm staff every single day." },
  { id:5,  name:"Rahul V",    role:"Full Stack Dev",        company:"DevNest",    city:"Gachibowli",   img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating:4, text:"The 24/7 access and power backup are game changers. I've had zero downtime during client calls. CoWork is the most reliable workspace I've used in Hyderabad." },
  { id:6,  name:"Ananya S",   role:"Content Strategist",   company:"Wordcraft",  city:"Hitech City",  img:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80", rating:5, text:"CoWork's pantry is stocked, the ambiance is calm, and the team events are genuinely fun. I renewed my membership without a second thought." },
  { id:7,  name:"Kiran T",    role:"Chartered Accountant", company:"FinEdge",    city:"Madhapur",     img:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80", rating:5, text:"I moved my entire office here and never looked back. Private cabin, meeting rooms on demand, and zero maintenance headaches. CoWork handles everything." },
  { id:8,  name:"Divya N",    role:"UX Researcher",         company:"Pixel Lab",  city:"Banjara Hills",img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80", rating:4, text:"Loved the ergonomic setups and quiet focus zones. My productivity tripled after switching from home to CoWork. The community is the biggest bonus." },
  { id:9,  name:"Mohit G",    role:"Growth Manager",        company:"Scalify",    city:"Hitech City",  img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", rating:5, text:"The Hitech City branch is perfectly located and always clean. Booking meeting rooms online is seamless. CoWork is built for people who take their work seriously." },
  { id:10, name:"Shruti L",   role:"EdTech Founder",        company:"LearnLoop",  city:"Gachibowli",   img:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", rating:5, text:"Pitched investors in CoWork's meeting room, closed my first round here. The energy of this space is contagious. Every entrepreneur needs a place like this." },
];

const CLS = ["c0","c1","c2","c3","c4"];

function Stars({ rating }) {
  return (
    <div className={styles.stars} aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starFill : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const n = testimonials.length;

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % n), 3200);
    return () => clearInterval(t);
  }, [n]);

  const indices = [
    (active - 2 + n) % n,
    (active - 1 + n) % n,
    active,
    (active + 1) % n,
    (active + 2) % n,
  ];

  const prevTestimonial = () => setActive(p => (p - 1 + n) % n);
  const nextTestimonial = () => setActive(p => (p + 1) % n);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.top}>
          <p className={styles.badge}>Testimonial</p>
          <h2 className={styles.heading}>Do more than just work. Create. Innovate.</h2>
        </div>

        <div className={styles.grid}>
          {indices.map((di, pos) => {
            const item = testimonials[di];
            return (
              <div key={`${di}-${pos}`} className={`${styles.card} ${styles[CLS[pos]]}`}>
                <img className={styles.avatar} src={item.img} alt={item.name} />
                <h3 className={styles.name}>{item.name}</h3>
                <p className={styles.role}>{item.role} · {item.company}</p>
                <p className={styles.text}>{item.text}</p>
                <Stars rating={item.rating} />
              </div>
            );
          })}
        </div>

        <div className={styles.controls}>
          <button 
            className={styles.arrowLeft} 
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            ‹
          </button>
          <div className={styles.dots}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button 
            className={styles.arrowRight} 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}