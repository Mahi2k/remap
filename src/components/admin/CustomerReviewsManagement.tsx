import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerReview {
  id: string;
  name: string;
  review: string;
  rating: number;
  image_url?: string;
  project_type?: string;
  is_active: boolean;
  sort_order: number;
}

const CustomerReviewsManagement = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    rating: 5,
    image_url: '',
    project_type: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update existing review
        const { error } = await supabase
          .from('customer_reviews')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        // Create new review
        const { error } = await supabase
          .from('customer_reviews')
          .insert(formData);

        if (error) throw error;
        toast.success('Review created successfully');
      }

      setEditingId(null);
      setShowAddForm(false);
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    }
  };

  const handleEdit = (review: CustomerReview) => {
    setFormData({
      name: review.name,
      review: review.review,
      rating: review.rating,
      image_url: review.image_url || '',
      project_type: review.project_type || '',
      is_active: review.is_active,
      sort_order: review.sort_order
    });
    setEditingId(review.id);
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      review: '',
      rating: 5,
      image_url: '',
      project_type: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer ${
              star <= rating ? 'text-amber-500 fill-current' : 'text-gray-300'
            }`}
            onClick={() => onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Customer Reviews Management</CardTitle>
          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              resetForm();
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="mb-6 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Review' : 'Add New Review'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Input
                    id="project_type"
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                    placeholder="e.g., Kitchen Remodel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="review">Review Text</Label>
                <Textarea
                  id="review"
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Enter the customer's review"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Rating</Label>
                  {renderStars(formData.rating, (rating) => 
                    setFormData({ ...formData, rating })
                  )}
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
              </div>

              <div>
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reviews found</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className={`${!review.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="font-semibold text-lg">{review.name}</h4>
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          Order: {review.sort_order}
                        </span>
                        {!review.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {review.project_type && (
                        <p className="text-amber-600 text-sm font-medium mb-2">
                          {review.project_type}
                        </p>
                      )}
                      <p className="text-gray-700 mb-2">"{review.review}"</p>
                      {review.image_url && (
                        <p className="text-xs text-gray-500">Image: {review.image_url}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerReviewsManagement;