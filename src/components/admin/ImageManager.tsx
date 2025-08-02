import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FolderOpen, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageCategory {
  id: string;
  name: string;
  description: string;
  folder_path: string;
  is_active: boolean;
}

interface ImageItem {
  id: string;
  s3_key: string;
  original_name: string;
  category_id: string | null;
  file_size: number | null;
  is_processed: boolean;
  created_at: string;
  category?: ImageCategory;
}

export function ImageManager() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('image_categories')
        .select('*')
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch images with category information
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select(`
          *,
          category:image_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch images and categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncFromS3 = async () => {
    try {
      setSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('s3-image-manager', {
        body: { action: 'sync-images' }
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced} new images from S3`,
      });

      await fetchData();
    } catch (error) {
      console.error('Error syncing from S3:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync images from S3",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const organizeImages = async () => {
    try {
      setOrganizing(true);
      
      const { data, error } = await supabase.functions.invoke('s3-image-manager', {
        body: { action: 'organize-images' }
      });

      if (error) throw error;

      toast({
        title: "Organization Complete",
        description: `Organized ${data.organized} images into categories`,
      });

      await fetchData();
    } catch (error) {
      console.error('Error organizing images:', error);
      toast({
        title: "Organization Failed",
        description: "Failed to organize images",
        variant: "destructive",
      });
    } finally {
      setOrganizing(false);
    }
  };

  const moveImageToCategory = async (imageKey: string, categoryId: string) => {
    try {
      const { error } = await supabase.functions.invoke('s3-image-manager', {
        body: { 
          action: 'move-image',
          imageKey,
          categoryId
        }
      });

      if (error) throw error;

      toast({
        title: "Image Moved",
        description: "Image has been moved to the selected category",
      });

      await fetchData();
    } catch (error) {
      console.error('Error moving image:', error);
      toast({
        title: "Move Failed",
        description: "Failed to move image to category",
        variant: "destructive",
      });
    }
  };

  const getS3Url = (s3Key: string) => {
    const region = 'us-east-1'; // You might want to make this configurable
    const bucketName = 'your-bucket-name'; // This should come from your environment
    return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Image Manager</h2>
          <p className="text-muted-foreground">
            Manage and organize images from your S3 bucket
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={organizeImages} disabled={organizing} variant="outline">
            {organizing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FolderOpen className="h-4 w-4 mr-2" />
            )}
            Auto Organize
          </Button>
          <Button onClick={syncFromS3} disabled={syncing}>
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync from S3
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images ({images.length})
            </CardTitle>
            <CardDescription>
              Images synced from your S3 bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={getS3Url(image.s3_key)}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium truncate" title={image.original_name}>
                      {image.original_name}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {image.category ? (
                        <Badge variant="secondary" className="text-xs">
                          {image.category.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Uncategorized
                        </Badge>
                      )}
                    </div>

                    <Select
                      value={image.category_id || ""}
                      onValueChange={(value) => moveImageToCategory(image.s3_key, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Move to category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {image.file_size && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round(image.file_size / 1024)} KB
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No images found. Click "Sync from S3" to import your images.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}