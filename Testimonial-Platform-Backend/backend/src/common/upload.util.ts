import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, unlink } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

export const UPLOAD_ROOT = join(process.cwd(), 'uploads');

export type UploadFolder = 'avatars' | 'logos' | 'photos' | 'videos';

const IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/;
const VIDEO_MIME = /^video\/(webm|mp4|quicktime|x-matroska|ogg)$/;

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function safeName(originalname: string) {
  const ext = extname(originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
}

/** Store every uploaded file inside ./uploads/<folder> */
export function singleFolderStorage(folder: UploadFolder) {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const dir = join(UPLOAD_ROOT, folder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
  });
}

/** Photos go to /photos, videos go to /videos (used by the public submit form) */
export const testimonialStorage = diskStorage({
  destination: (_req, file, cb) => {
    const dir = join(
      UPLOAD_ROOT,
      file.fieldname === 'video' ? 'videos' : 'photos',
    );
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
});

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) => {
  if (IMAGE_MIME.test(file.mimetype)) return cb(null, true);
  cb(
    new BadRequestException('Only jpg, png, webp or gif images are allowed'),
    false,
  );
};

export const testimonialFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) => {
  if (file.fieldname === 'photo' && IMAGE_MIME.test(file.mimetype))
    return cb(null, true);
  // browsers report recorded clips as "video/webm;codecs=vp8,opus"
  if (file.fieldname === 'video' && VIDEO_MIME.test(file.mimetype.split(';')[0]))
    return cb(null, true);
  cb(new BadRequestException(`Invalid file for field "${file.fieldname}"`), false);
};

/** Delete a stored file (path is relative to ./uploads, e.g. "videos/abc.webm") */
export function removeUpload(relativePath?: string | null) {
  if (!relativePath) return;
  unlink(join(UPLOAD_ROOT, relativePath), () => undefined);
}

export function removeFiles(files?: Express.Multer.File[]) {
  files?.forEach((f) => unlink(f.path, () => undefined));
}
