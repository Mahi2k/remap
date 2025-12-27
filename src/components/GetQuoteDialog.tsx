import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from './ContactForm';
import { supabase } from '@/integrations/supabase/client';

interface GetQuoteDialogProps {
  children: React.ReactNode;
}

export const GetQuoteDialog = ({ children }: GetQuoteDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<'whatsapp' | 'form' | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('918087247972');

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      const { data } = await supabase
        .from('company_contact_info')
        .select('field_value')
        .eq('field_name', 'whatsapp')
        .eq('is_active', true)
        .single();
      
      if (data?.field_value) {
        setWhatsappNumber(data.field_value.replace(/\D/g, ''));
      }
    };
    fetchWhatsAppNumber();
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hi! I would like to get a quote for my interior design project.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetDialog = () => {
    setSelectedOption(null);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetDialog()}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Your Quote</DialogTitle>
        </DialogHeader>
        
        {selectedOption === null && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              Choose how you'd like to connect with us
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleWhatsAppClick}>
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick chat on WhatsApp for instant quotes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOption('form')}>
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Contact Form</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out a detailed form for comprehensive quotes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedOption === 'form' && (
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedOption(null)}
              className="mb-4"
            >
              ← Back to options
            </Button>
            <ContactForm onSuccess={resetDialog} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};