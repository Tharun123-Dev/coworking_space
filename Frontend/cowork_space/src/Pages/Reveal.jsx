import { motion } from "framer-motion";

const smoothEase = [0.16, 1, 0.3, 1];

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
            staggerChildren: 0.2,
          },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, index) => {
            const isImage =
              child?.type === "img" ||
              child?.props?.src;

            return (
              <motion.div
                key={index}
                variants={{
                  hidden: isImage
                    ? { opacity: 0, x: -120, scale: 0.95 }
                    : { opacity: 0, y: 120, scale: 0.96 },

                  show: isImage
                    ? {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: { duration: 1.2, ease: smoothEase },
                      }
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 1.2, ease: smoothEase },
                      },
                }}
              >
                {child}
              </motion.div>
            );
          })
        : (() => {
            const isImage =
              children?.type === "img" ||
              children?.props?.src;

            return (
              <motion.div
                variants={{
                  hidden: isImage
                    ? { opacity: 0, x: -120, scale: 0.95 }
                    : { opacity: 0, y: 120, scale: 0.96 },

                  show: isImage
                    ? {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: { duration: 1.2, ease: smoothEase },
                      }
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 1.2, ease: smoothEase },
                      },
                }}
              >
                {children}
              </motion.div>
            );
          })()}
    </motion.div>
  );
};

export default Reveal;