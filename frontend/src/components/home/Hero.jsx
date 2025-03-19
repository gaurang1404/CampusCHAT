"use client"

import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"

export default function Hero() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <section className="relative lg:max-w-[1200px] m-auto text-[#3B1C32] py-24">
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
              Welcome to{" "}
              <span className="text-[#63144c] relative">
                CampusCHAT
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#63144c] opacity-30 rounded-full"></span>
              </span>
            </motion.h1>
            <div className="mt-4 text-lg lg:text-xl text-gray-700 h-20 sm:h-16 mb-12">
              <TypeAnimation
                sequence={[
                  "Your campus management portal. Stay connected, informed, and productive like never before.",
                  1000,
                ]}
                wrapper="p"
                speed={80}
                repeat={1}
                className="mt-4 text-lg lg:text-xl"
              />
            </div>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start sm:items-center gap-4 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="text-white bg-[#63144c] hover:bg-[#5c0c45] font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 flex items-center justify-center"
                onClick={() => {
                  document.getElementById("getstarted")?.scrollIntoView({ behavior: "smooth" })
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>

              <motion.button
                className="sm:ml-4 border-2 border-[#63144c] text-[#63144c] font-semibold py-3 px-8 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center"
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
              alt="CampusCHAT Dashboard"
              className="w-[500px] rounded-2xl bg-transparent shadow-2xl border border-gray-100"
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

