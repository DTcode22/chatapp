import { Attachment } from '@/types';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export async function processFileUpload(file: File): Promise<Attachment> {
  const base64 = await fileToBase64(file);

  return {
    type: isImageFile(file) ? 'image' : 'file',
    url: base64,
    name: file.name,
  };
}

export function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
