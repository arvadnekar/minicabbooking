// app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

const whatWeStandFor = [
  {
    index: 0,
    title: "Safety First",
    content:
      "Every ride is tracked and monitored to ensure the safety of our passengers and drivers.",
  },
  {
    index: 1,
    title: "Empowering Drivers",
    content:
      "We provide tools, support, and fair earnings so drivers can thrive in their work.",
  },
  {
    index: 2,
    title: "Sustainable Future",
    content:
      "We’re committed to reducing our carbon footprint through eco-friendly initiatives.",
  },
]

export default function AboutPage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="relative ">
        <div className="absolute inset-0">
          <Image
            src="/images/1.jpg"
            alt="About Hero"
            fill
            className="object-cover opacity-80"
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-2xl">
            We’re building the future of transportation — one ride at a time.
            Discover our story, mission, and the people behind the wheel.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className=" py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg leading-relaxed mb-4">
              At MiniCab, we believe transportation should be accessible,
              reliable, and safe for everyone. Our mission is to connect
              communities and empower drivers through cutting-edge technology
              and world-class service.
            </p>
            <p className="text-lg leading-relaxed">
              From quick city commutes to long-distance trips, we make every
              journey smooth and stress-free.
            </p>
          </div>
          <div>
            <Image
              src="/images/2.jpg" // replace with your own image
              alt="Our Mission"
              width={600}
              height={400}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Values / Feature Blocks */}
      <section className=" py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-10">

            {whatWeStandFor.map((item) => (
              <Card key={item.index}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="bg-black text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to ride with us?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Whether you’re a driver or a passenger, join the MiniCab community and
          experience the difference.
        </p>
          <Link href="/contact" className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition">Get in Touch</Link>    
      </section>
    </main>
  );
}
