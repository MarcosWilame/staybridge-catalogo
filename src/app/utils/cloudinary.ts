const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || 'staybridge/properties';

type ImageVariant = 'card' | 'detail' | 'thumb' | 'admin';

const IMAGE_TRANSFORMS: Record<ImageVariant, string> = {
  card: 'f_auto,q_auto,c_fill,w_720,h_520',
  detail: 'f_auto,q_auto,c_fill,w_1200,h_760',
  thumb: 'f_auto,q_auto,c_fill,w_240,h_180',
  admin: 'f_auto,q_auto,c_fill,w_360,h_240',
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export function getOptimizedImageUrl(
  src: string | undefined,
  variant: ImageVariant
) {
  if (!src) return '';

  if (!src.includes('/res.cloudinary.com/') || !src.includes('/upload/')) {
    return src;
  }

  return src.replace('/upload/', `/upload/${IMAGE_TRANSFORMS[variant]}/`);
}

export function preloadImage(src: string | undefined) {
  if (!src) return;

  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

export async function uploadImageToCloudinary(file: File) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary nao configurado');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', CLOUDINARY_FOLDER);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Falha ao enviar imagem ao Cloudinary');
  }

  return data.secure_url;
}
