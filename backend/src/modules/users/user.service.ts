import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Author } from '../authors/entities/author.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/change-password.dto';
import { BaseI18nService } from '../shared/baseI18n.service';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { UserSerializer } from './serializers/user.serializer';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../shared/cloudinary.service';
@Injectable()
export class UserService extends BaseI18nService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    i18n: I18nService,
    Context: RequestI18nContextService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    super(i18n, Context);
  }

  async findUser(userId: number, withAuthor = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: withAuthor ? ['author'] : [],
    });
    if (!user) {
      throw new NotFoundException(await this.t('users.user_not_found'));
    }
    return user;
  }

  async getProfileById(userId: number): Promise<UserSerializer> {
    try {
      const user = await this.findUser(userId, true);
      return plainToInstance(UserSerializer, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(await this.t('user.fetch_profile_failed'));
    }
  }

  async updateProfile(
    data: UpdateProfileDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<UserSerializer> {
    try {
      const user = await this.findUser(userId, true);

      if (data.fullName !== undefined) user.fullName = data.fullName;

      if (file) {
        const avatarUrl = await this.cloudinaryService.uploadImage(file);
        user.avatarUrl = avatarUrl;
      }

      if (user.author) {
        if (data.penName !== undefined) user.author.penName = data.penName;
        if (data.bio !== undefined) user.author.bio = data.bio;
        await this.authorRepository.save(user.author);
      }

      const updatedUser = await this.userRepository.save(user);
      return plainToInstance(UserSerializer, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        await this.t('users.update_profile_failed'),
      );
    }
  }

  async changePassword(data: UpdatePasswordDto, userId: number) {
    try {
      const user = await this.findUser(userId);

      const isMatch = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash,
      );
      if (!isMatch) {
        throw new BadRequestException(
          await this.t('user.current_password_invalid'),
        );
      }

      if (data.newPassword !== data.confirmPassword) {
        throw new BadRequestException(
          await this.t('user.password_confirm_mismatch'),
        );
      }

      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(data.newPassword, salt);

      await this.userRepository.save(user);
      return { message: await this.t('user.password_changed_success') };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(
        await this.t('user.change_password_failed'),
      );
    }
  }
}
