import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Mail, Save } from "lucide-react";

interface CommunicationSettings {
  whatsapp: string;
  email: string;
  whatsappId?: string;
  emailId?: string;
}

export default function CommunicationSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CommunicationSettings>({
    whatsapp: '',
    email: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_contact_info')
        .select('*')
        .in('field_name', ['whatsapp', 'email']);

      if (error) throw error;

      const whatsappEntry = data?.find(item => item.field_name === 'whatsapp');
      const emailEntry = data?.find(item => item.field_name === 'email');

      setSettings({
        whatsapp: whatsappEntry?.field_value || '',
        email: emailEntry?.field_value || '',
        whatsappId: whatsappEntry?.id,
        emailId: emailEntry?.id
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load communication settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update or insert WhatsApp number
      if (settings.whatsappId) {
        await supabase
          .from('company_contact_info')
          .update({ field_value: settings.whatsapp, updated_at: new Date().toISOString() })
          .eq('id', settings.whatsappId);
      } else {
        await supabase
          .from('company_contact_info')
          .insert({ field_name: 'whatsapp', field_value: settings.whatsapp, is_active: true });
      }

      // Update or insert email
      if (settings.emailId) {
        await supabase
          .from('company_contact_info')
          .update({ field_value: settings.email, updated_at: new Date().toISOString() })
          .eq('id', settings.emailId);
      } else {
        await supabase
          .from('company_contact_info')
          .insert({ field_name: 'email', field_value: settings.email, is_active: true });
      }

      toast({
        title: "Success",
        description: "Communication settings updated successfully."
      });
      
      // Reload to get latest IDs
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save communication settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp Settings
          </CardTitle>
          <CardDescription>
            Configure the WhatsApp number for customer inquiries and quotes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="e.g., 918319455418 (with country code, no +)"
              value={settings.whatsapp}
              onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Enter the number with country code without the + sign (e.g., 918319455418 for India)
            </p>
          </div>
          
          {settings.whatsapp && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Preview URL:</strong>{" "}
                <a 
                  href={`https://wa.me/${settings.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  wa.me/{settings.whatsapp}
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Contact Email Settings
          </CardTitle>
          <CardDescription>
            Configure the email address for contact form submissions and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., contact@yourcompany.com"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              This email will receive contact form submissions and customer inquiries
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
