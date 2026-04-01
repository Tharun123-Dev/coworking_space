import { motion } from "framer-motion";

/* 🔥 Global Animation Settings */
const smoothEase = [0.16, 1, 0.3, 1];

/* 🔥 Main Component */
const Reveal = ({ children }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.25,
          },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 120,
                  scale: 0.96,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 1.4,
                    ease: smoothEase,
                  },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : (
          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 120,
                scale: 0.96,
              },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 1.4,
                  ease: smoothEase,
                },
              },
            }}
          >
            {children}
          </motion.div>
        )}
    </motion.div>
  );
};

export default Reveal;