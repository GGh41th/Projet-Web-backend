import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Image } from '../entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Create organized directory structure: uploads/images/YYYY/MM/DD
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const uploadPath = join('uploads', 'images', year.toString(), month, day);

          // Create directory if it doesn't exist
          fs.mkdirSync(uploadPath, { recursive: true });

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generate unique filename: timestamp-randomid-originalname
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const basename = file.originalname.replace(ext, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
          const filename = `${uniqueSuffix}-${basename}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow only image files
        const allowedMimes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedMimes.test(file.mimetype);
        const extAllowed = allowedMimes.test(extname(file.originalname).toLowerCase());

        if (mimetype && extAllowed) {
          return cb(null, true);
        }
        cb(
          new Error(
            'Only image files are allowed (jpeg, jpg, png, gif, webp)',
          ),
        );
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
