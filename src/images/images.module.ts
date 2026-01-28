import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Image } from '../entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/images';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
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
