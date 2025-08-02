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

    if (action === 'update-credentials') {
      const requestBody = await req.json();
      const result = await updateS3Credentials(requestBody.credentials);
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
  console.log('Starting listS3Objects function');
  const awsAccessKeyId = Deno.env.get('ACCESS_KEY_ID');
  const awsSecretAccessKey = Deno.env.get('SECRET_ACCESS_KEY');
  const bucketName = Deno.env.get('S3_BUCKET_NAME');
  const region = 'us-east-1';

  console.log('Environment variables check:', {
    hasAccessKey: !!awsAccessKeyId,
    hasSecretKey: !!awsSecretAccessKey,
    bucketName: bucketName
  });

  if (!awsAccessKeyId || !awsSecretAccessKey || !bucketName) {
    throw new Error('Missing AWS configuration');
  }

  // Create AWS V4 signature
  const host = `${bucketName}.s3.amazonaws.com`;
  const endpoint = `https://${host}/`;
  const method = 'GET';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  
  const t = new Date();
  const amzdate = t.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const datestamp = amzdate.substring(0, 8);

  // Create canonical headers
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzdate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  // Create canonical request
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
  const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

  // Create signing key and signature
  const signingKey = await getSignatureKey(awsSecretAccessKey, datestamp, region, 's3');
  const signature = await hmacSha256(signingKey, stringToSign);

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  console.log('Making S3 request to:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Host': host,
      'X-Amz-Date': amzdate,
      'Authorization': authorizationHeader,
    },
  });

  console.log('S3 API response status:', response.status, response.statusText);

  if (!response.ok) {
    const responseText = await response.text();
    console.log('S3 API error response:', responseText);
    throw new Error(`S3 API error: ${response.statusText} - ${responseText}`);
  }

  const xmlText = await response.text();
  console.log('S3 XML response length:', xmlText.length);
  return parseS3ListResponse(xmlText);
}

// Helper functions for AWS signature
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: Uint8Array, message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<Uint8Array> {
  const kDate = await hmacSha256Raw(new TextEncoder().encode(`AWS4${key}`), dateStamp);
  const kRegion = await hmacSha256Raw(kDate, regionName);
  const kService = await hmacSha256Raw(kRegion, serviceName);
  const kSigning = await hmacSha256Raw(kService, 'aws4_request');
  return kSigning;
}

async function hmacSha256Raw(key: Uint8Array, message: string): Promise<Uint8Array> {
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  return new Uint8Array(signature);
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

async function createAwsSignature(accessKey: string, secretKey: string, region: string, bucket: string, date: string): Promise<string> {
  // Simplified AWS signature - in production, use proper AWS SDK
  const algorithm = 'AWS4-HMAC-SHA256';
  const credential = `${accessKey}/${date.slice(0, 8)}/${region}/s3/aws4_request`;
  
  return `${algorithm} Credential=${credential}, SignedHeaders=host;x-amz-date, Signature=placeholder`;
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
  console.log('Starting listS3AccessPointObjects function');
  const awsAccessKeyId = Deno.env.get('ACCESS_KEY_ID');
  const awsSecretAccessKey = Deno.env.get('SECRET_ACCESS_KEY');
  const region = 'us-east-1';
  
  if (!awsAccessKeyId || !awsSecretAccessKey) {
    throw new Error('Missing AWS configuration');
  }

  // Using the access point alias provided
  const accessPointAlias = Deno.env.get('S3_BUCKET_ACCESS_POINT_ALIAS') || 's3-remap-access-poin-kjk177d1mznin7tchb5cdtzh4qjesuse1b-s3alias';
  const host = `${accessPointAlias}.s3-accesspoint.${region}.amazonaws.com`;
  const endpoint = `https://${host}/`;
  
  const t = new Date();
  const amzdate = t.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const datestamp = amzdate.substring(0, 8);

  // Create canonical headers
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzdate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  // Create canonical request
  const canonicalRequest = `GET\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
  const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

  // Create signing key and signature
  const signingKey = await getSignatureKey(awsSecretAccessKey, datestamp, region, 's3');
  const signature = await hmacSha256(signingKey, stringToSign);

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  console.log('Making S3 Access Point request to:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Host': host,
      'X-Amz-Date': amzdate,
      'Authorization': authorizationHeader,
    },
  });

  console.log('S3 Access Point API response status:', response.status, response.statusText);

  if (!response.ok) {
    const responseText = await response.text();
    console.log('S3 Access Point API error response:', responseText);
    throw new Error(`S3 Access Point API error: ${response.statusText} - ${responseText}`);
  }

  const xmlText = await response.text();
  console.log('S3 Access Point XML response length:', xmlText.length);
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