import { NavBar } from "../shared/NavBar"
import { ChartDemo } from "./ChartDemo"
import Hero from "./Hero"
import { RegistrationComponent } from "./RegistrationComponent"
import { Footer } from "./Footer"

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <ChartDemo />
      <RegistrationComponent />
      <Footer />
    </div>
  )
}

export default Landing

