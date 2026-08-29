import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function createMulterUploader(subfolder: 'progress' | 'meals' | 'avatars') {
  const uploadDirectory = path.join(env.resolvedStoragePath, subfolder);

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const fileId = uuidv4();
      cb(null, `${fileId}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Formato de imagen inválido. Solo se admiten JPG, PNG y WEBP.'));
      }
    },
  });
}

export const uploadProgressPhoto = createMulterUploader('progress').single('photo');
export const uploadMealPhoto = createMulterUploader('meals').single('photo');
export const uploadAvatarPhoto = createMulterUploader('avatars').single('avatar');
