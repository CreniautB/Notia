import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema';
import {
  CreateMediaAssetDto,
  UpdateMediaAssetDto,
  MediaAssetQueryDto,
} from './dto/media-asset.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaAsset.name)
    private mediaAssetModel: Model<MediaAssetDocument>,
  ) {}

  async create(createMediaAssetDto: CreateMediaAssetDto): Promise<MediaAsset> {
    const createdMediaAsset = new this.mediaAssetModel(createMediaAssetDto);
    return createdMediaAsset.save();
  }

  async findAll(query: MediaAssetQueryDto): Promise<{
    data: MediaAsset[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, category, search, isPublic, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const total = await this.mediaAssetModel.countDocuments(filter);
    const data = await this.mediaAssetModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<MediaAsset> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    const mediaAsset = await this.mediaAssetModel.findById(id).exec();
    if (!mediaAsset) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    return mediaAsset;
  }

  async update(
    id: string,
    updateMediaAssetDto: UpdateMediaAssetDto,
  ): Promise<MediaAsset> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    const updatedMediaAsset = await this.mediaAssetModel
      .findByIdAndUpdate(id, updateMediaAssetDto, { new: true })
      .exec();

    if (!updatedMediaAsset) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    return updatedMediaAsset;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    const result = await this.mediaAssetModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }
  }

  async incrementUsageCount(id: string): Promise<MediaAsset> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    const updatedMediaAsset = await this.mediaAssetModel
      .findByIdAndUpdate(id, { $inc: { usageCount: 1 } }, { new: true })
      .exec();

    if (!updatedMediaAsset) {
      throw new NotFoundException(`Media asset with ID ${id} not found`);
    }

    return updatedMediaAsset;
  }

  async findByCategory(
    category: string,
    limit: number = 10,
  ): Promise<MediaAsset[]> {
    return this.mediaAssetModel
      .find({ category, isPublic: true })
      .limit(limit)
      .sort({ usageCount: -1 })
      .exec();
  }

  async search(term: string, limit: number = 10): Promise<MediaAsset[]> {
    return this.mediaAssetModel
      .find(
        {
          $text: { $search: term },
          isPublic: true,
        },
        {
          score: { $meta: 'textScore' },
        },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }
}
