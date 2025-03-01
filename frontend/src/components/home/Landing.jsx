import React from 'react'
import { NavBar } from '../shared/NavBar'
import { ChartDemo } from './ChartDemo'
import Hero from './Hero'
import { RegistrationComponent } from './RegistrationComponent'
import { Footer } from './Footer'

const Landing = () => {
  return (
    <div>
        <NavBar/>
        <Hero/>
        <ChartDemo/>
        <RegistrationComponent/>
        <Footer/>
    </div>
  )
}

export default Landing;
