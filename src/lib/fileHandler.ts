import { Attachment } from '@/types';

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// Process file upload and return attachment
export async function processFileUpload(file: File): Promise<Attachment> {
  const base64 = await fileToBase64(file);
  
  return {
    type: isImageFile(file) ? 'image' : 'file',
    url: base64,
    name: file.name
  };
}

// Process text file and return its content
export function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
