import ImageKit from "@imagekit/nodejs";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

const ensureImageKitConfig = () => {
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit is not configured");
  }
};

// Initialize ImageKit client with correct property names
const imagekit = new ImageKit({
  publicKey: publicKey!,
  privateKey: privateKey!,
  urlEndpoint: urlEndpoint!,
} as any); // Type assertion to bypass strict typing

export interface UploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
}

export const uploadMedia = async (
  file: Express.Multer.File,
): Promise<UploadResponse> => {
  ensureImageKitConfig();

  try {
    // Convert buffer to base64 string as required by ImageKit
    const base64File = file.buffer.toString('base64');
    
    console.log('Uploading to ImageKit:', {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });
    
    const result = await imagekit.files.upload({
      file: base64File,
      fileName: file.originalname,
      folder: "/social-network/posts",
    });

    console.log('ImageKit upload successful:', {
      fileId: result.fileId,
      url: result.url
    });

    return {
      fileId: result.fileId!,
      name: result.name!,
      url: result.url!,
      thumbnailUrl: result.thumbnailUrl!,
      height: result.height!,
      width: result.width!,
      size: result.size!,
      filePath: result.filePath!,
      fileType: result.fileType!,
    };
  } catch (error) {
    console.error("ImageKit upload error details:", error);
    throw new Error("ImageKit upload failed");
  }
};
