const AVATAR_MAX_SIZE = 256;
const AVATAR_QUALITY = 0.8;
const AVATAR_MIME = 'image/webp';

/**
 * Downscale an image file to a square avatar suitable for storage and peer transfer.
 * Returns a data URL (WebP) that fits within typical size constraints.
 */
export function downscaleAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const {naturalWidth: w, naturalHeight: h} = img;
            const size = Math.min(w, h, AVATAR_MAX_SIZE);

            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Center-crop the image into a square
            const srcX = (w - Math.min(w, h)) / 2;
            const srcY = (h - Math.min(w, h)) / 2;
            const srcSize = Math.min(w, h);

            ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

            const dataUrl = canvas.toDataURL(AVATAR_MIME, AVATAR_QUALITY);
            resolve(dataUrl);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}
