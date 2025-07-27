import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Award, Users, Clock, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerReview {
  id: string;
  name: string;
  review: string;
  rating: number;
  image_url?: string;
  project_type?: string;
}

interface Stat {
  id: string;
  icon_name: string;
  number_value: string;
  label: string;
  sort_order: number;
}

const About = () => {
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Users,
      Award,
      Clock,
      Star
    };
    const IconComponent = icons[iconName] || Users;
    return <IconComponent className="h-8 w-8" />;
  };

  // Fallback placeholder images
  const fallbackImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format", 
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsResponse, statsResponse] = await Promise.all([
          supabase
            .from('customer_reviews')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('stats')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
        ]);

        if (reviewsResponse.error) {
          console.error('Error fetching customer reviews:', reviewsResponse.error);
        } else {
          setCustomerReviews(reviewsResponse.data || []);
        }

        if (statsResponse.error) {
          console.error('Error fetching stats:', statsResponse.error);
        } else {
          setStats(statsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCustomerImage = (review: CustomerReview, index: number) => {
    return review.image_url || fallbackImages[index % fallbackImages.length];
  };

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
                  key={stat.id}
                  className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-stone-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 text-white rounded-full mb-3">
                    {getIconComponent(stat.icon_name)}
                  </div>
                  <div className="text-2xl font-bold text-stone-800 mb-1">{stat.number_value}</div>
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

        {/* Customer Reviews Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              What Our <span className="text-amber-600">Customers</span> Say
            </h3>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Don't just take our word for it. Hear from our satisfied clients who have 
              experienced the Remap difference in their spaces.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <Carousel 
              className="w-full max-w-5xl mx-auto" 
              opts={{ 
                align: "start", 
                loop: true,
                dragFree: true,
                duration: 30
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {customerReviews.map((review, index) => (
                  <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-white to-stone-50 transform hover:-translate-y-1">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Quote Icon */}
                        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4 mx-auto">
                          <Quote className="h-6 w-6 text-amber-600" />
                        </div>

                        {/* Rating Stars */}
                        <div className="flex justify-center mb-4">
                          {[...Array(review.rating)].map((_, starIndex) => (
                            <Star key={starIndex} className="h-5 w-5 text-amber-500 fill-current" />
                          ))}
                        </div>

                        {/* Review Text */}
                        <p className="text-stone-600 text-center mb-6 leading-relaxed flex-grow">
                          "{review.review}"
                        </p>

                        {/* Customer Info */}
                        <div className="text-center mt-auto">
                          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-amber-200">
                            <img 
                              src={getCustomerImage(review, index)} 
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-semibold text-stone-800 mb-1">{review.name}</h4>
                          {review.project_type && (
                            <p className="text-amber-600 text-sm font-medium">{review.project_type}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 hover:bg-amber-50 hover:border-amber-200" />
              <CarouselNext className="hidden md:flex -right-12 hover:bg-amber-50 hover:border-amber-200" />
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;