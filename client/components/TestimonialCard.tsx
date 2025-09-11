'use client';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Testimonial } from './data/testimonials';

interface TestimonialCardProps {
  name?: string;
  role?: string;
  content?: string;
  rating?: number;
  avatarUrl?: string; // optional avatar
}

export const TestimonialCard = ({
  name = "Anonymous",
  role = "Customer",
  content = "No testimonial provided.",
  rating = 0,
  avatarUrl,
}: TestimonialCardProps) => (
  <div className="p-6 bg-gradient-to-br from-white/90 to-gray-100 rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center mb-4 space-x-3">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover border-2 border-accent"
        />
      )}
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    </div>

    <p className="text-gray-700 mb-6 leading-relaxed text-sm md:text-base">&ldquo;{content}&rdquo;</p>

    <div className="mt-auto">
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-sm text-gray-500">{role}</div>
    </div>
  </div>
);

export const TestimonialsGrid = () => (
  <section className="py-12 ">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Testimonial.map((t, index) => (
          <TestimonialCard
            key={index}
            name={t.name}
            role={t.role}
            content={t.content}
            rating={t.rating}
          />
        ))}
      </div>
    </div>
  </section>
);
