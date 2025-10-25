import { Lock, Heart, Flame } from 'lucide-react';
import Image from 'next/image';
import FeatureCard from './FeatureCard';

export default function Hero() {
  return (
    <section className="min-h-screen pt-20 flex items-center justify-center bg-neutral-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto py-12 lg:py-16">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-primary text-center mb-12 lg:mb-16 tracking-tight">
          Date Smarter
        </h1>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: 1M+ Matches Made */}
          <FeatureCard variant="stat">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent mb-4">
                1M+
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white">
                Matches Made
              </h3>
            </div>
          </FeatureCard>

          {/* Card 2: Swipe Card (Prominent) */}
          <FeatureCard variant="gradient" className="md:row-span-2">
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8">
                Swipe →
              </h2>
              {/* Phone Mockups with Images */}
              <div className="relative w-full max-w-md h-64 lg:h-80 flex items-center justify-center">
                {/* Left Phone */}
                <div className="absolute left-0 z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="w-32 lg:w-40 h-44 lg:h-56 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                    <Image
                      src="https://picsum.photos/seed/girl1/300/400"
                      alt="Profile 1"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Center Phone (Main) */}
                <div className="relative z-20 transform scale-110 hover:scale-115 transition-transform duration-300">
                  <div className="w-36 lg:w-44 h-48 lg:h-60 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                    <Image
                      src="https://picsum.photos/seed/girl2/300/400"
                      alt="Profile 2"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    {/* Swipe indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>

                {/* Right Phone */}
                <div className="absolute right-0 z-10 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="w-32 lg:w-40 h-44 lg:h-56 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                    <Image
                      src="https://picsum.photos/seed/girl3/300/400"
                      alt="Profile 3"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Card 3: Interest-Based Matching */}
          <FeatureCard>
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <h3 className="text-xl lg:text-2xl font-semibold mb-2">
                <span className="text-primary">Interest-Based</span>
                <br />
                <span className="text-white">Matching</span>
              </h3>
            </div>
          </FeatureCard>

          {/* Card 4: Privacy-first design */}
          <FeatureCard>
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="mb-4">
                <Lock className="w-16 h-16 lg:w-20 lg:h-20 text-primary" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white">
                Privacy-first
                <br />
                design
              </h3>
            </div>
          </FeatureCard>

          {/* Card 5: Go Beyond Just "Hey" */}
          <FeatureCard>
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="flex gap-3 mb-4 text-3xl lg:text-4xl">
                <Flame className="w-10 h-10 text-secondary" />
                <span>💋</span>
                <Heart className="w-10 h-10 text-accent" />
                <span>🍕</span>
                <span>🎉</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white">
                Go Beyond Just
                <br />
                &quot;Hey&quot;
              </h3>
            </div>
          </FeatureCard>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16 lg:mt-24">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary">
            Once upon a Swipe...
          </h2>
        </div>
      </div>
    </section>
  );
}

