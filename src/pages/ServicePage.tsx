import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { GetQuoteDialog } from '@/components/GetQuoteDialog';

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPortfolio } = useQuery({
    queryKey: ['related-portfolio', service?.title],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_active', true)
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!service,
  });

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Service Not Found</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const features = service.features || [];

  return (
    <>
      <Helmet>
        <title>{service.meta_title || `${service.title} | Remap Interior Design`}</title>
        <meta name="description" content={service.meta_description || service.description || ''} />
      </Helmet>

      <div className="min-h-screen bg-stone-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-stone-800 to-stone-900 text-white py-20 lg:py-32">
          <div className="absolute inset-0 bg-black/40"></div>
          {service.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${service.image_url})` }}
            ></div>
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/#services" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.title}</h1>
            <p className="text-xl text-stone-200 max-w-2xl">{service.description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {service.full_description && (
                <div className="prose prose-lg max-w-none mb-12">
                  <h2 className="text-3xl font-bold text-stone-800 mb-6">About This Service</h2>
                  <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                    {service.full_description}
                  </p>
                </div>
              )}

              {features.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-stone-800 mb-6">What's Included</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                        <CheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - CTA */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 bg-gradient-to-br from-amber-50 to-stone-50 border-amber-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-stone-800 mb-4">Ready to Get Started?</h3>
                  <p className="text-stone-600 mb-6">
                    Let's discuss how we can transform your space with our {service.title.toLowerCase()} service.
                  </p>
                  <GetQuoteDialog>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white mb-4"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Get a Free Quote
                    </Button>
                  </GetQuoteDialog>
                  <Link to="/#contact" className="block">
                    <Button variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-50">
                      Contact Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Portfolio */}
          {relatedPortfolio && relatedPortfolio.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">Related Projects</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPortfolio.map((item) => (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-stone-800">{item.title}</h3>
                      {item.category && (
                        <span className="text-sm text-amber-600">{item.category}</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="bg-stone-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Transform Your Space Today</h2>
            <p className="text-stone-300 mb-8">
              Our expert team is ready to bring your vision to life. Contact us for a personalized consultation.
            </p>
            <GetQuoteDialog>
              <Button 
                size="lg"
                className="bg-amber-600 hover:bg-amber-700"
              >
                Schedule a Consultation
              </Button>
            </GetQuoteDialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePage;
