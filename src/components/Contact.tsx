
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CompanyContactInfo = Database['public']['Tables']['company_contact_info']['Row'];

const Contact = () => {
  const [contactInfo, setContactInfo] = useState<CompanyContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('company_contact_info')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading contact info:', error);
      } else {
        setContactInfo(data || []);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactIcon = (fieldName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'phone': <Phone className="h-6 w-6" />,
      'email': <Mail className="h-6 w-6" />,
      'address': <MapPin className="h-6 w-6" />,
      'hours': <Clock className="h-6 w-6" />
    };
    return icons[fieldName] || <Phone className="h-6 w-6" />;
  };

  const getContactAction = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'phone':
        return `tel:${value.replace(/\D/g, '')}`;
      case 'email':
        return `mailto:${value}`;
      default:
        return null;
    }
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: { [key: string]: string } = {
      'phone': 'Phone',
      'email': 'Email',
      'address': 'Address',
      'hours': 'Hours'
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-stone-800 to-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Let's Create Something Beautiful
          </h2>
          <p className="text-xl text-stone-300 max-w-3xl mx-auto">
            Ready to transform your space? Get in touch with us today for a consultation 
            and let's bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-white">Send us a message</h3>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
            
            {loading ? (
              <div className="text-center text-stone-300">Loading contact information...</div>
            ) : contactInfo.length === 0 ? (
              <div className="text-center text-stone-300">No contact information available.</div>
            ) : (
              contactInfo.map((info, index) => {
                const action = getContactAction(info.field_name, info.field_value);
                return (
                  <Card 
                    key={info.id}
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {getContactIcon(info.field_name)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{getFieldLabel(info.field_name)}</h4>
                          {action ? (
                            <a 
                              href={action}
                              className="text-stone-300 hover:text-amber-400 transition-colors duration-300"
                            >
                              {info.field_value}
                            </a>
                          ) : (
                            <p className="text-stone-300">{info.field_value}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 mt-16 pt-8 text-center">
          <p className="text-stone-400">
            © 2024 Remap Interior Design. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
