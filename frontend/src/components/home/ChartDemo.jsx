"use client"

import { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { AreaChartComponent } from "./AreaChartComponent"
import { LineChartComponent } from "./LineChartComponent"
import { PieChartComponent } from "./PieChartComponent"

export const ChartDemo = () => {
  // Controls for animations
  const headingControls = useAnimation()
  const chartControls = useAnimation()

  // Refs to detect when elements are in view
  const [headingRef, headingInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const [chartsRef, chartsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Start animations when elements come into view
  useEffect(() => {
    if (headingInView) {
      headingControls.start("visible")
    }
    if (chartsInView) {
      chartControls.start("visible")
    }
  }, [headingInView, chartsInView, headingControls, chartControls])

  // Animation variants
  const headingVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const chartContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const chartItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div id="dashboard" className="w-full bg-gradient-to-b from-[#63144c] to-[#4a0f39] pt-12 pb-[10rem]">
      <motion.div
        ref={headingRef}
        initial="hidden"
        animate={headingControls}
        variants={headingVariants}
        className="lg:max-w-[1200px] m-auto flex justify-evenly lg:justify-between items-center mt-12 flex-wrap px-6"
      >
        <div className="pl-4 lg:p-5 max-w-3xl mx-auto text-center lg:text-left">
          <span className="text-4xl md:text-5xl text-white font-extrabold leading-tight">
            Try our interactive dashboard features!
          </span>
          <p className="text-white/80 mt-4 text-lg max-w-2xl mx-auto lg:mx-0">
            Visualize your campus data with our powerful analytics tools
          </p>
        </div>
      </motion.div>

      <motion.div
        ref={chartsRef}
        initial="hidden"
        animate={chartControls}
        variants={chartContainerVariants}
        className="lg:max-w-[1200px] m-auto flex justify-evenly lg:justify-between items-stretch mt-16 flex-wrap px-6 gap-8"
      >
        <motion.div variants={chartItemVariants} className="w-full sm:w-[45%] lg:w-[30%] p-2">
          <AreaChartComponent />
        </motion.div>

        <motion.div variants={chartItemVariants} className="w-full sm:w-[45%] lg:w-[30%] p-2">
          <PieChartComponent />
        </motion.div>

        <motion.div variants={chartItemVariants} className="w-full sm:w-[45%] lg:w-[30%] p-2">
          <LineChartComponent />
        </motion.div>
      </motion.div>
    </div>
  )
}

