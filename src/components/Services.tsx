import { Card, CardContent } from '@/components/ui/card';
import { Palette, Home, Lightbulb, Sofa, TreePine, Sparkles, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Palette,
  Sofa,
  Lightbulb,
  TreePine,
  Sparkles,
};

const fallbackServices = [
  {
    icon_name: "Home",
    title: "Complete Home Design",
    description: "Full-service interior design from concept to completion, transforming your entire living space.",
    slug: "complete-home-design"
  },
  {
    icon_name: "Palette",
    title: "Color Consultation",
    description: "Expert color selection and palette development to create the perfect mood and atmosphere.",
    slug: "color-consultation"
  },
  {
    icon_name: "Sofa",
    title: "Furniture Selection",
    description: "Curated furniture pieces that blend style, comfort, and functionality for your unique needs.",
    slug: "furniture-selection"
  },
  {
    icon_name: "Lightbulb",
    title: "Lighting Design",
    description: "Strategic lighting solutions that enhance ambiance and highlight your space's best features.",
    slug: "lighting-design"
  },
  {
    icon_name: "TreePine",
    title: "Space Planning",
    description: "Optimized layouts that maximize functionality while maintaining beautiful aesthetic appeal.",
    slug: "space-planning"
  },
  {
    icon_name: "Sparkles",
    title: "Styling & Accessories",
    description: "Final touches with carefully selected accessories, art, and decor to complete your look.",
    slug: "styling-and-accessories"
  }
];

const Services = () => {
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const displayServices = services && services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            From initial concept to final styling, we offer comprehensive interior design services 
            tailored to your vision and lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => {
            const IconComponent = iconMap[service.icon_name || 'Home'] || Home;
            const slug = service.slug || service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
            
            return (
              <Link to={`/${slug}`} key={service.title}>
                <Card 
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-none bg-gradient-to-br from-stone-50 to-amber-50/30 cursor-pointer h-full"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-4 group-hover:text-amber-600 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
