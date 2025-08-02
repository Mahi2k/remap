import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { UsersList, UserRolesManager } from "@/components/admin/UserManagement";
import { Settings } from "@/components/admin/Settings";
import CustomerReviewsManagement from "@/components/admin/CustomerReviewsManagement";
import StatsManager from "@/components/admin/StatsManager";

import type { Database } from "@/integrations/supabase/types";

type HeroContent = Database['public']['Tables']['hero_content']['Row'];
type AboutContent = Database['public']['Tables']['about_content']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
type CompanyContactInfo = Database['public']['Tables']['company_contact_info']['Row'];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Content states
  const [heroContent, setHeroContent] = useState<HeroContent[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [companyContactInfo, setCompanyContactInfo] = useState<CompanyContactInfo[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const hasAdminRole = roles?.some(role => role.role === 'admin');
      
      if (!hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadAllContent();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadAllContent = async () => {
    try {
      const [heroData, aboutData, servicesData, portfolioData, contactData, companyContactData] = await Promise.all([
        supabase.from('hero_content').select('*').order('created_at', { ascending: false }),
        supabase.from('about_content').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('portfolio_items').select('*').order('sort_order'),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('company_contact_info').select('*').order('field_name')
      ]);

      setHeroContent(heroData.data || []);
      setAboutContent(aboutData.data || []);
      setServices(servicesData.data || []);
      setPortfolioItems(portfolioData.data || []);
      setContactSubmissions(contactData.data || []);
      setCompanyContactInfo(companyContactData.data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'hero':
        return <HeroContentManager content={heroContent} onUpdate={loadAllContent} />;
      case 'about':
        return <AboutContentManager content={aboutContent} onUpdate={loadAllContent} />;
      case 'stats':
        return <StatsManager />;
      case 'services':
        return <ServicesManager services={services} onUpdate={loadAllContent} />;
      case 'portfolio':
        return <PortfolioManager items={portfolioItems} onUpdate={loadAllContent} />;
      case 'customer-reviews':
        return <CustomerReviewsManagement />;
      case 'contact':
        return <ContactManager submissions={contactSubmissions} onUpdate={loadAllContent} />;
      case 'company-contact':
        return <CompanyContactManager contactInfo={companyContactInfo} onUpdate={loadAllContent} />;
      case 'users-list':
        return <UsersList />;
      case 'user-roles':
        return <UserRolesManager />;
      case 'settings':
        return <Settings />;
      default:
        return <HeroContentManager content={heroContent} onUpdate={loadAllContent} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Hero Content Manager Component
function HeroContentManager({ content, onUpdate }: { content: HeroContent[], onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<HeroContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    background_image_url: '',
    is_active: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabase
          .from('hero_content')
          .update(formData)
          .eq('id', editingItem.id);
        toast({ title: "Success", description: "Hero content updated successfully." });
      } else {
        await supabase
          .from('hero_content')
          .insert([formData]);
        toast({ title: "Success", description: "Hero content created successfully." });
      }
      
      setEditingItem(null);
      setFormData({ title: '', subtitle: '', description: '', background_image_url: '', is_active: false });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save hero content.", variant: "destructive" });
    }
  };

  const handleEdit = (item: HeroContent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      background_image_url: item.background_image_url || '',
      is_active: item.is_active || false
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('hero_content').delete().eq('id', id);
      toast({ title: "Success", description: "Hero content deleted successfully." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete hero content.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit' : 'Create'} Hero Content</CardTitle>
          <CardDescription>
            Manage the hero section content on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="background_image_url">Background Image URL</Label>
              <Input
                id="background_image_url"
                value={formData.background_image_url}
                onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: '', subtitle: '', description: '', background_image_url: '', is_active: false });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Hero Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// About Content Manager Component
function AboutContentManager({ content, onUpdate }: { content: AboutContent[], onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<AboutContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    team_image_url: '',
    is_active: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabase
          .from('about_content')
          .update(formData)
          .eq('id', editingItem.id);
        toast({ title: "Success", description: "About content updated successfully." });
      } else {
        await supabase
          .from('about_content')
          .insert([formData]);
        toast({ title: "Success", description: "About content created successfully." });
      }
      
      setEditingItem(null);
      setFormData({ title: '', description: '', team_image_url: '', is_active: false });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save about content.", variant: "destructive" });
    }
  };

  const handleEdit = (item: AboutContent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      team_image_url: item.team_image_url || '',
      is_active: item.is_active || false
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('about_content').delete().eq('id', id);
      toast({ title: "Success", description: "About content deleted successfully." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete about content.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit' : 'Create'} About Content</CardTitle>
          <CardDescription>
            Manage the about section content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="team_image_url">Team Image URL</Label>
              <Input
                id="team_image_url"
                value={formData.team_image_url}
                onChange={(e) => setFormData({ ...formData, team_image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: '', description: '', team_image_url: '', is_active: false });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing About Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Services Manager Component
function ServicesManager({ services, onUpdate }: { services: Service[], onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_name: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabase
          .from('services')
          .update(formData)
          .eq('id', editingItem.id);
        toast({ title: "Success", description: "Service updated successfully." });
      } else {
        await supabase
          .from('services')
          .insert([formData]);
        toast({ title: "Success", description: "Service created successfully." });
      }
      
      setEditingItem(null);
      setFormData({ title: '', description: '', icon_name: '', image_url: '', sort_order: 0, is_active: true });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save service.", variant: "destructive" });
    }
  };

  const handleEdit = (item: Service) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      icon_name: item.icon_name || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active || true
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('services').delete().eq('id', id);
      toast({ title: "Success", description: "Service deleted successfully." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete service.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit' : 'Create'} Service</CardTitle>
          <CardDescription>
            Manage services offered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="icon_name">Icon Name (Lucide icon)</Label>
              <Input
                id="icon_name"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="e.g., home, wrench, palette"
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: '', description: '', icon_name: '', image_url: '', sort_order: 0, is_active: true });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Order: {item.sort_order}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Portfolio Manager Component
function PortfolioManager({ items, onUpdate }: { items: PortfolioItem[], onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image_url: '',
    sort_order: 0,
    is_featured: false,
    is_active: true
  });
  const { toast } = useToast();

  const categories = ['living', 'bedroom', 'kitchen', 'office', 'bathroom'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabase
          .from('portfolio_items')
          .update(formData)
          .eq('id', editingItem.id);
        toast({ title: "Success", description: "Portfolio item updated successfully." });
      } else {
        await supabase
          .from('portfolio_items')
          .insert([formData]);
        toast({ title: "Success", description: "Portfolio item created successfully." });
      }
      
      setEditingItem(null);
      setFormData({ title: '', description: '', category: '', image_url: '', sort_order: 0, is_featured: false, is_active: true });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save portfolio item.", variant: "destructive" });
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
      is_featured: item.is_featured || false,
      is_active: item.is_active || true
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('portfolio_items').delete().eq('id', id);
      toast({ title: "Success", description: "Portfolio item deleted successfully." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete portfolio item.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit' : 'Create'} Portfolio Item</CardTitle>
          <CardDescription>
            Manage portfolio projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: '', description: '', category: '', image_url: '', sort_order: 0, is_featured: false, is_active: true });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Portfolio Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {item.is_featured && <Badge variant="destructive">Featured</Badge>}
                    <Badge variant="outline">Order: {item.sort_order}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contact Manager Component
function ContactManager({ submissions, onUpdate }: { submissions: ContactSubmission[], onUpdate: () => void }) {
  const { toast } = useToast();

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', id);
      toast({ title: "Success", description: "Message marked as read." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Submissions</CardTitle>
        <CardDescription>
          View and manage contact form submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">
                    {submission.first_name} {submission.last_name}
                  </h3>
                  <p className="text-muted-foreground">{submission.email}</p>
                  {submission.project_type && (
                    <Badge variant="outline" className="mt-1">
                      {submission.project_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={submission.is_read ? "secondary" : "default"}>
                    {submission.is_read ? "Read" : "Unread"}
                  </Badge>
                  {!submission.is_read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsRead(submission.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {submission.message && (
                <div className="mt-3 p-3 bg-muted rounded">
                  <p className="text-sm">{submission.message}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Submitted: {new Date(submission.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No contact submissions yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Company Contact Manager Component
function CompanyContactManager({ contactInfo, onUpdate }: { contactInfo: CompanyContactInfo[], onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<CompanyContactInfo | null>(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_value: '',
    is_active: true
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabase
          .from('company_contact_info')
          .update({
            field_value: formData.field_value,
            is_active: formData.is_active
          })
          .eq('id', editingItem.id);
        toast({ title: "Success", description: "Contact information updated successfully." });
      } else {
        await supabase
          .from('company_contact_info')
          .insert([formData]);
        toast({ title: "Success", description: "Contact information created successfully." });
      }
      
      setEditingItem(null);
      setFormData({ field_name: '', field_value: '', is_active: true });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save contact information.", variant: "destructive" });
    }
  };

  const handleEdit = (item: CompanyContactInfo) => {
    setEditingItem(item);
    setFormData({
      field_name: item.field_name,
      field_value: item.field_value,
      is_active: item.is_active || true
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('company_contact_info').delete().eq('id', id);
      toast({ title: "Success", description: "Contact information deleted successfully." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete contact information.", variant: "destructive" });
    }
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: { [key: string]: string } = {
      'phone': 'Phone Number',
      'email': 'Email Address',
      'address': 'Physical Address',
      'hours': 'Business Hours'
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit' : 'Create'} Company Contact Information</CardTitle>
          <CardDescription>
            Manage your company's contact information displayed on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="field_name">Field Name</Label>
              <Input
                id="field_name"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                placeholder="e.g., phone, email, address, hours"
                required
                disabled={!!editingItem}
              />
            </div>
            <div>
              <Label htmlFor="field_value">Field Value</Label>
              <Textarea
                id="field_value"
                value={formData.field_value}
                onChange={(e) => setFormData({ ...formData, field_value: e.target.value })}
                placeholder="Enter the contact information"
                required
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ field_name: '', field_value: '', is_active: true });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{getFieldLabel(item.field_name)}</h3>
                  <p className="text-muted-foreground mt-1">{item.field_value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}