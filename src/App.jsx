import Footer from './components/Footer'
import Header from './components/Header'
import About from './components/About'
import Skills from './components/Skills'
import './App.css'

function App() {
  return (
    <div className='flex-1 bg-red'>
      <Header />
      <Skills />
      <About />
      <Footer />
    </div>
  )
}

export default App
