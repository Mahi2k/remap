
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { ContactForm } from './ContactForm';

const Contact = () => {
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "hello@urbannest.design",
      action: "mailto:hello@urbannest.design"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      details: "123 Design District, Creative City, CC 12345",
      action: null
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      details: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
      action: null
    }
  ];

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
            
            {contactInfo.map((info, index) => (
              <Card 
                key={info.title}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{info.title}</h4>
                      {info.action ? (
                        <a 
                          href={info.action}
                          className="text-stone-300 hover:text-amber-400 transition-colors duration-300"
                        >
                          {info.details}
                        </a>
                      ) : (
                        <p className="text-stone-300">{info.details}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
