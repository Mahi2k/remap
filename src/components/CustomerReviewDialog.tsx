import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerReviewDialogProps {
  children: React.ReactNode;
}

const CustomerReviewDialog = ({ children }: CustomerReviewDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    rating: 5,
    project_type: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!formData.review.trim() || formData.review.length < 10) {
      toast({
        title: "Invalid Review",
        description: "Please enter a detailed review (at least 10 characters).",
        variant: "destructive"
      });
      return;
    }

    // Sanitize input to prevent XSS
    const sanitizedData = {
      name: formData.name.trim().slice(0, 100), // Limit name length
      review: formData.review.trim().slice(0, 1000), // Limit review length
      rating: Math.max(1, Math.min(5, formData.rating)), // Ensure rating is 1-5
      project_type: formData.project_type.trim().slice(0, 50), // Limit project type length
      is_active: false // Reviews start inactive for moderation
    };

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('customer_reviews')
        .insert([sanitizedData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review will be published after moderation.",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        review: '',
        rating: 5,
        project_type: ''
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit your review. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= currentRating 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300 hover:text-amber-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Share Your Experience
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_type">Project Type</Label>
            <Select
              value={formData.project_type}
              onValueChange={(value) => setFormData({ ...formData, project_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home Renovation">Home Renovation</SelectItem>
                <SelectItem value="Kitchen Remodel">Kitchen Remodel</SelectItem>
                <SelectItem value="Bathroom Remodel">Bathroom Remodel</SelectItem>
                <SelectItem value="Office Design">Office Design</SelectItem>
                <SelectItem value="Apartment Makeover">Apartment Makeover</SelectItem>
                <SelectItem value="Commercial Space">Commercial Space</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStars(formData.rating, (rating) => setFormData({ ...formData, rating }))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Share your experience with our services..."
              maxLength={1000}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.review.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerReviewDialog;