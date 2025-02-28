import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"

export default function Hero() {
  return (
    <div className="bg-white">
      <section className="relative lg:max-w-[1200px] m-auto text-[#3B1C32] py-20">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between">
          {/* Left Content */}
          <motion.div
            className="max-w-2xl text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome to <span className="text-[#63144c]">CampusCHAT</span>
            </motion.h1>
            <div className="mt-4 text-lg lg:text-xl text-black h-20 sm:h-16 mb-12">
              <TypeAnimation
                sequence={[
                  "Your AI-powered Campus Assistant. Stay connected, informed, and productive like never before.",
                  1000,
                ]}
                wrapper="p"
                speed={80}
                repeat={1}
                className="mt-4 text-lg lg:text-xl text-black"
              />
            </div>
            <motion.div
              className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="text-white bg-[#63144c] hover:bg-[#5c0c45] font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
                onClick={() => {
                  document.getElementById("getstarted")?.scrollIntoView({ behavior: "smooth" })
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>

              <motion.button
                className="sm:ml-4 border-2 border-black text-[#63144c] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Image / Illustration */}
          <motion.div
            className="hidden mt-10 lg:mt-0 w-full lg:w-1/2 lg:flex justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.img
              src="/Homepage.png"
              alt="AI-powered CampusCHAT"
              className="w-[500px] rounded-lg bg-transparent shadow-2xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{
                duration: 2,
                repeat: 0,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
