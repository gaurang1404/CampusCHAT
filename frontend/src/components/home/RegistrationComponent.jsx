import { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useNavigate } from "react-router-dom";

export const RegistrationComponent = () => {
  const navigate = useNavigate();
  // Animation controls
  const headingControls = useAnimation()
  const buttonsControls = useAnimation()

  // Refs to detect when elements are in view
  const [headingRef, headingInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const [buttonsRef, buttonsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Start animations when elements come into view
  useEffect(() => {
    if (headingInView) {
      headingControls.start("visible")
    }
    if (buttonsInView) {
      buttonsControls.start("visible")
    }
  }, [headingInView, buttonsInView, headingControls, buttonsControls])

  // Animation variants
  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  }

  const buttonsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Button hover animations
  const studentButtonHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    backgroundColor: "white",
    color: "#39aa43",
    transition: { duration: 0.3 },
  }

  const facultyButtonHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    backgroundColor: "white",
    color: "#395baa",
    transition: { duration: 0.3 },
  }

  const adminButtonHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    color: "#63144c",
    transition: { duration: 0.3 },
  }

  return (
    <div className="w-full">
      <div id="getstarted" className="max-w-[1200px] m-auto border-black mb-20 mt-20 pb-20 pt-20">
        <motion.div
          ref={headingRef}
          initial="hidden"
          animate={headingControls}
          variants={headingVariants}
          className="flex flex-col gap-2 mb-20 pl-5 sm:mb-10"
        >
          <motion.h2 className="text-5xl font-extrabold text-[#63144c]">Tell us about yourself.</motion.h2>
          <motion.p
            className="text-2xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            What would you like to use CampusCHAT as?
          </motion.p>
        </motion.div>

        <motion.div
          ref={buttonsRef}
          initial="hidden"
          animate={buttonsControls}
          variants={buttonsContainerVariants}
          className="flex flex-col items-center gap-5"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:justify-between w-full">
            <motion.div
              variants={buttonVariants}
              whileHover={studentButtonHover}
              whileTap={{ scale: 0.98 }}
              className="text-4xl w-[90%] sm:w-[48%] p-10 m-auto sm:m-5 flex justify-center items-center text-white bg-[#63144c] font-extrabold shadow-2xl cursor-pointer"
            >
              Student
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover={facultyButtonHover}
              whileTap={{ scale: 0.98 }}
              className="text-4xl w-[90%] m-auto sm:m-5 sm:w-[48%] p-10 flex justify-center items-center text-white bg-[#63144c] font-extrabold shadow-2xl cursor-pointer"
            >
              Faculty
            </motion.div>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover={adminButtonHover}
            whileTap={{ scale: 0.98 }}
            className="text-4xl font-extrabold w-[90%] sm:m-0 sm:m-full flex justify-center items-center p-10 border-4 border-[#63144c] shadow-md cursor-pointer"
            onClick={() => navigate("/admin-register")}
          >
            Admin
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

