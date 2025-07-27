import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Users, Award, Clock, Star, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Stat {
  id?: string;
  icon_name: string;
  number_value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

const iconOptions = [
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Clock', label: 'Clock', icon: Clock },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'BarChart3', label: 'Chart', icon: BarChart3 },
];

export default function StatsManager() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Stat>({
    icon_name: 'Users',
    number_value: '',
    label: '',
    sort_order: 0,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('stats')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Statistic updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('stats')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Statistic created successfully",
        });
      }

      setFormData({
        icon_name: 'Users',
        number_value: '',
        label: '',
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      fetchStats();
    } catch (error) {
      console.error('Error saving stat:', error);
      toast({
        title: "Error",
        description: "Failed to save statistic",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (stat: Stat) => {
    setFormData(stat);
    setEditingId(stat.id!);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return;

    try {
      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Statistic deleted successfully",
      });
      fetchStats();
    } catch (error) {
      console.error('Error deleting stat:', error);
      toast({
        title: "Error",
        description: "Failed to delete statistic",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      icon_name: 'Users',
      number_value: '',
      label: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistics Management</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Statistic' : 'Add New Statistic'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon</Label>
                <Select value={formData.icon_name} onValueChange={(value) => setFormData({...formData, icon_name: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_value">Number Value</Label>
                <Input
                  id="number_value"
                  value={formData.number_value}
                  onChange={(e) => setFormData({...formData, number_value: e.target.value})}
                  placeholder="e.g. 500+, 4.9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  placeholder="e.g. Happy Clients"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? 'Update Statistic' : 'Add Statistic'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => {
                const IconComponent = iconOptions.find(icon => icon.value === stat.icon_name)?.icon || Users;
                return (
                  <TableRow key={stat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {stat.icon_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{stat.number_value}</TableCell>
                    <TableCell>{stat.label}</TableCell>
                    <TableCell>{stat.sort_order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        stat.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {stat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(stat)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(stat.id!)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}