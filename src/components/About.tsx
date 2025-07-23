
import { Card, CardContent } from '@/components/ui/card';
import { Star, Award, Users, Clock } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: <Users className="h-8 w-8" />, number: "500+", label: "Happy Clients" },
    { icon: <Award className="h-8 w-8" />, number: "15+", label: "Awards Won" },
    { icon: <Clock className="h-8 w-8" />, number: "10+", label: "Years Experience" },
    { icon: <Star className="h-8 w-8" />, number: "4.9", label: "Client Rating" }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
              About <span className="text-amber-600">Remap</span>
            </h2>
            
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Founded with a passion for creating beautiful, functional spaces, Remap has been 
              transforming homes and commercial spaces for over a decade. Our team of experienced 
              designers combines creativity with practicality to deliver interiors that truly reflect 
              our clients' personalities and lifestyles.
            </p>
            
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              We believe that great design should be accessible to everyone. Whether you're looking 
              to refresh a single room or completely renovate your entire home, we work closely with 
              you to understand your vision and bring it to life within your budget.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-stone-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 text-white rounded-full mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-stone-800 mb-1">{stat.number}</div>
                  <div className="text-stone-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <video
                src="/videos/about-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <Card className="absolute -bottom-6 -left-6 bg-white shadow-xl border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">Award Winning</div>
                    <div className="text-stone-600 text-sm">Design Excellence</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
