"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function HeroSection() {
  const images = [
    "https://tazama.co.zm/wp-content/uploads/2024/10/2-1.jpg", 
    "https://tazama.co.zm/wp-content/uploads/2024/10/4-1.jpg",
    "https://tazama.co.zm/wp-content/uploads/2024/10/pc1.jpg",
    "https://tazama.co.zm/wp-content/uploads/2024/10/3-1.jpg"
]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000) // Change image every 3 seconds

    return () => clearInterval(interval) // Clean up the interval on component unmount
  }, [images.length])

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden ">
      {images.map((src, index) => (
        <Image
        key={src}
        src={src}
        alt={`Carousel image ${index + 1}`}
        fill
        priority={index === 0}
        unoptimized
        className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-in-out ${
          index === currentImageIndex ? "opacity-100" : "opacity-0"
        }`}
      />
      
      ))}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
      <div className="relative z-20 text-white text-center max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">TAZAMA PIPELINES LIMITED</h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8">Reliable Transporter Of Petroleum Products</p>
      </div>
    </section>
  )
}
