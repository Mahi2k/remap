import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface S3Object {
  Key?: string;
  Size?: number;
  LastModified?: Date;
  ETag?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, categoryId, imageKey } = await req.json();

    if (action === 'list-bucket') {
      const objects = await listS3Objects();
      return new Response(JSON.stringify({ objects }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync-images') {
      const result = await syncImagesToDatabase(supabaseClient);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'organize-images') {
      const result = await organizeImages(supabaseClient);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync-access-point') {
      const result = await syncFromAccessPoint(supabaseClient);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'move-image' && categoryId && imageKey) {
      const result = await moveImageToCategory(supabaseClient, imageKey, categoryId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'test-connection') {
      const result = await testS3Connection();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-credentials' && (await req.json()).credentials) {
      const body = await req.json();
      const result = await updateS3Credentials(body.credentials);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in s3-image-manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function listS3Objects(): Promise<S3Object[]> {
  const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const awsRegion = Deno.env.get('AWS_REGION');
  const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME');

  if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !bucketName) {
    throw new Error('Missing AWS configuration');
  }

  // Create AWS signature and make S3 API request
  const endpoint = `https://s3.${awsRegion}.amazonaws.com/${bucketName}`;
  const date = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': await createAwsSignature(awsAccessKeyId, awsSecretAccessKey, awsRegion, bucketName, date),
      'x-amz-date': date,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 API error: ${response.statusText}`);
  }

  const xmlText = await response.text();
  return parseS3ListResponse(xmlText);
}

async function createAwsSignature(accessKey: string, secretKey: string, region: string, bucket: string, date: string): Promise<string> {
  // Simplified AWS signature - in production, use proper AWS SDK
  const algorithm = 'AWS4-HMAC-SHA256';
  const credential = `${accessKey}/${date.slice(0, 8)}/${region}/s3/aws4_request`;
  
  return `${algorithm} Credential=${credential}, SignedHeaders=host;x-amz-date, Signature=placeholder`;
}

function parseS3ListResponse(xml: string): S3Object[] {
  // Simple XML parsing - in production, use proper XML parser
  const objects: S3Object[] = [];
  const keyMatches = xml.match(/<Key>(.*?)<\/Key>/g) || [];
  
  keyMatches.forEach(match => {
    const key = match.replace(/<\/?Key>/g, '');
    if (key && (key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png') || key.endsWith('.webp'))) {
      objects.push({ Key: key });
    }
  });
  
  return objects;
}

async function syncImagesToDatabase(supabase: any) {
  const objects = await listS3Objects();
  const synced = [];
  const errors = [];

  for (const obj of objects) {
    if (!obj.Key) continue;

    try {
      // Check if image already exists
      const { data: existing } = await supabase
        .from('images')
        .select('id')
        .eq('s3_key', obj.Key)
        .single();

      if (!existing) {
        // Determine category based on key pattern
        const categoryId = await determineCategoryFromKey(supabase, obj.Key);
        
        const { error } = await supabase
          .from('images')
          .insert({
            s3_key: obj.Key,
            original_name: obj.Key.split('/').pop() || obj.Key,
            category_id: categoryId,
            file_size: obj.Size,
            is_processed: true,
          });

        if (error) throw error;
        synced.push(obj.Key);
      }
    } catch (error) {
      console.error(`Error syncing ${obj.Key}:`, error);
      errors.push({ key: obj.Key, error: error.message });
    }
  }

  return { synced: synced.length, errors };
}

async function determineCategoryFromKey(supabase: any, key: string): Promise<string | null> {
  const { data: categories } = await supabase
    .from('image_categories')
    .select('id, folder_path')
    .eq('is_active', true);

  if (!categories) return null;

  // Find matching category based on key path
  for (const category of categories) {
    if (key.toLowerCase().includes(category.folder_path.toLowerCase().replace('/', ''))) {
      return category.id;
    }
  }

  // Default to miscellaneous category
  const miscCategory = categories.find(c => c.folder_path === 'misc/');
  return miscCategory?.id || null;
}

async function organizeImages(supabase: any) {
  const { data: images } = await supabase
    .from('images')
    .select('id, s3_key, category_id')
    .is('category_id', null);

  if (!images) return { organized: 0 };

  let organized = 0;
  for (const image of images) {
    const categoryId = await determineCategoryFromKey(supabase, image.s3_key);
    if (categoryId) {
      await supabase
        .from('images')
        .update({ category_id: categoryId })
        .eq('id', image.id);
      organized++;
    }
  }

  return { organized };
}

async function moveImageToCategory(supabase: any, imageKey: string, categoryId: string) {
  const { error } = await supabase
    .from('images')
    .update({ category_id: categoryId })
    .eq('s3_key', imageKey);

  if (error) throw error;
  return { success: true };
}

async function testS3Connection() {
  try {
    // Try to list objects to test connection
    await listS3Objects();
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return { success: false, message: error.message };
  }
}

async function updateS3Credentials(credentials: any) {
  // Note: In a real implementation, you would update the Supabase secrets
  // For now, we'll just validate the credentials format
  const { accessKeyId, secretAccessKey, region, bucketName } = credentials;
  
  if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
    throw new Error('All credential fields are required');
  }
  
  // In production, you would use Supabase Management API to update secrets
  // For this demo, we'll just return success
  return { 
    success: true, 
    message: 'Credentials would be updated in production environment' 
  };
}

async function listS3AccessPointObjects(): Promise<S3Object[]> {
  const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const awsRegion = Deno.env.get('AWS_REGION');
  
  if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
    throw new Error('Missing AWS configuration');
  }

  // Using the access point alias provided
  const accessPointAlias = 's3-remap-access-poin-kjk177d1mznin7tchb5cdtzh4qjesuse1b-s3alias';
  const endpoint = `https://${accessPointAlias}.s3-accesspoint.${awsRegion}.amazonaws.com/`;
  const date = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': await createAwsSignature(awsAccessKeyId, awsSecretAccessKey, awsRegion, accessPointAlias, date),
      'x-amz-date': date,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 Access Point API error: ${response.statusText}`);
  }

  const xmlText = await response.text();
  return parseS3ListResponse(xmlText);
}

async function syncFromAccessPoint(supabase: any) {
  const objects = await listS3AccessPointObjects();
  const synced = [];
  const errors = [];

  for (const obj of objects) {
    if (!obj.Key) continue;

    try {
      // Check if image already exists
      const { data: existing } = await supabase
        .from('images')
        .select('id')
        .eq('s3_key', obj.Key)
        .maybeSingle();

      if (!existing) {
        // Determine category based on key pattern
        const categoryId = await determineCategoryFromKey(supabase, obj.Key);
        
        const { error } = await supabase
          .from('images')
          .insert({
            s3_key: obj.Key,
            original_name: obj.Key.split('/').pop() || obj.Key,
            category_id: categoryId,
            file_size: obj.Size,
            is_processed: true,
          });

        if (error) throw error;
        synced.push(obj.Key);
      }
    } catch (error) {
      console.error(`Error syncing ${obj.Key} from access point:`, error);
      errors.push({ key: obj.Key, error: error.message });
    }
  }

  return { synced: synced.length, errors, source: 'access-point' };
}