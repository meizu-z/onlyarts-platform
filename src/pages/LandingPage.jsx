import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Eye, Video, Globe } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredExhibitions = [
    { title: 'Digital Dreams', artist: '@artist1', image: '🎨', color: 'from-[#7C5FFF]/20 to-[#FF5F9E]/20' },
    { title: 'Abstract Visions', artist: '@artist2', image: '🖼️', color: 'from-blue-600/20 to-[#7C5FFF]/20' },
    { title: 'Modern Art', artist: '@artist3', image: '🎭', color: 'from-[#FF5F9E]/20 to-orange-600/20' },
    { title: 'Urban Landscapes', artist: '@artist4', image: '🌆', color: 'from-teal-600/20 to-blue-600/20' },
  ];

  const features = [
    {
      icon: <Eye size={32} />,
      title: 'Virtual Exhibitions',
      description: 'Curated digital galleries showcasing the finest artworks from artists worldwide',
      color: 'from-[#7C5FFF]/20 to-[#FF5F9E]/20'
    },
    {
      icon: <Video size={32} />,
      title: 'Live Art Experiences',
      description: 'Watch artists create in real-time and interact directly with your favorite creators',
      color: 'from-[#FF5F9E]/20 to-orange-600/20'
    },
    {
      icon: <Globe size={32} />,
      title: 'Immersive Galleries',
      description: 'Experience art in stunning virtual reality environments (coming soon)',
      color: 'from-blue-600/20 to-[#7C5FFF]/20'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Artists' },
    { value: '50K+', label: 'Artworks' },
    { value: '100K+', label: 'Collectors' },
    { value: '1M+', label: 'Views' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C5FFF]/20 via-transparent to-[#FF5F9E]/20"></div>
        
        {/* Floating orbs with parallax */}
        <div 
          className="absolute top-20 left-10 w-32 h-32 bg-[#7C5FFF]/30 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-[#FF5F9E]/30 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.3}px)`, animationDelay: '1s' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#B15FFF]/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-8">
            <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#7C5FFF]/30 to-[#FF5F9E]/30 border border-[#7C5FFF]/40 rounded-full text-[#B15FFF] text-sm font-medium shadow-lg shadow-[#7C5FFF]/20 hover:shadow-[#7C5FFF]/40 transition-all duration-300 hover:scale-105">
              ✨ Welcome to the Future of Digital Art
            </span>
          </div>
          
          {/* Hero text - FIXED TO ALWAYS BE VISIBLE */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="inline-block bg-gradient-to-r from-[#7C5FFF] via-[#B15FFF] to-[#FF5F9E] bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradient 3s ease infinite' }}>
              DISCOVER ART
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-[#FF5F9E] via-[#B15FFF] to-[#7C5FFF] bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradient 3s ease infinite' }}>
              WITHOUT BOUNDARIES
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#f2e9dd]/70 mb-12 max-w-3xl mx-auto">
            A premium platform for artists and collectors to connect, create, and trade digital masterpieces
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="gap-2 group relative overflow-hidden bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5F9E] to-[#7C5FFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/explore')}
              className="transform hover:scale-105 transition-all duration-300"
            >
              Explore Exhibitions
            </Button>
          </div>

          <p className="mt-6 text-[#f2e9dd]/50 text-sm">
            No credit card required • Start with our free tier
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-[#FF5F9E]/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-white/10 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-[#f2e9dd]/70 group-hover:text-[#f2e9dd] transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#f2e9dd] mb-4">
              Why Choose OnlyArts?
            </h2>
            <p className="text-xl text-[#f2e9dd]/70 max-w-2xl mx-auto">
              Everything you need to showcase, discover, and collect digital art
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                hover 
                className={`p-8 text-center bg-gradient-to-br ${feature.color} border border-white/10 group relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 transition-all duration-500`}
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C5FFF]/30 to-[#FF5F9E]/30 flex items-center justify-center text-[#B15FFF] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#f2e9dd] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#f2e9dd]/70">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exhibitions */}
      <section className="py-20 px-4 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#f2e9dd] mb-2">
                Featured Exhibitions
              </h2>
              <p className="text-[#f2e9dd]/70">
                Explore curated collections from top artists
              </p>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-[#7C5FFF]/50 transition-all duration-300 group"
            >
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExhibitions.map((exhibition, idx) => (
              <Card 
                key={idx} 
                hover 
                noPadding
                onClick={() => navigate('/explore')}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C5FFF]/50 hover:shadow-lg hover:shadow-[#7C5FFF]/20 transition-all duration-300">
                  <div className={`aspect-square bg-gradient-to-br ${exhibition.color} flex items-center justify-center text-8xl relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                      {exhibition.image}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                      {exhibition.title}
                    </h3>
                    <p className="text-sm text-[#f2e9dd]/50">{exhibition.artist}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#7C5FFF]/20 via-[#1a1a1a] to-[#FF5F9E]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <Sparkles className="inline-block text-[#B15FFF] mb-4 animate-pulse" size={48} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#f2e9dd] mb-6">
            JOIN THOUSANDS OF ARTISTS & COLLECTORS
          </h2>
          <p className="text-xl text-[#f2e9dd]/70 mb-8">
            Free tier available • No credit card required • Start creating today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="gap-2 group bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
            >
              Create Your Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/subscriptions')}
              className="transform hover:scale-105 transition-all duration-300"
            >
              View Plans & Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#f2e9dd] text-center mb-12">
            Trusted by Creators Worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "OnlyArts transformed how I showcase my work. The exhibition features are game-changing!", author: "Artist Name", role: "Digital Artist" },
              { quote: "Best platform for discovering emerging artists. The VIP showcases are worth every peso!", author: "Collector Name", role: "Art Collector" },
              { quote: "The livestream feature lets me connect with fans in real-time. Incredible community!", author: "Creator Name", role: "3D Artist" }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                <div className="text-[#B15FFF] mb-4 text-4xl">"</div>
                <p className="text-[#f2e9dd]/80 mb-4 italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E]"></div>
                  <div>
                    <p className="font-bold text-[#f2e9dd]">{testimonial.author}</p>
                    <p className="text-sm text-[#f2e9dd]/50">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export { LandingPage };