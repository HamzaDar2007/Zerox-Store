import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private catRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
  ) {}

  async createCategory(dto: Partial<Category>): Promise<Category> {
    const cat = this.catRepo.create(dto);
    return this.catRepo.save(cat);
  }

  async findAllCategories(page = 1, limit = 50): Promise<Category[]> {
    return this.catRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findCategory(id: string): Promise<Category> {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async updateCategory(id: string, dto: Partial<Category>): Promise<Category> {
    const cat = await this.findCategory(id);
    Object.assign(cat, dto);
    return this.catRepo.save(cat);
  }

  async removeCategory(id: string): Promise<void> {
    const cat = await this.findCategory(id);
    await this.catRepo.remove(cat);
  }

  async createBrand(dto: Partial<Brand>): Promise<Brand> {
    const brand = this.brandRepo.create(dto);
    return this.brandRepo.save(brand);
  }

  async findAllBrands(page = 1, limit = 50): Promise<Brand[]> {
    return this.brandRepo.find({
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findBrand(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async updateBrand(id: string, dto: Partial<Brand>): Promise<Brand> {
    const brand = await this.findBrand(id);
    Object.assign(brand, dto);
    return this.brandRepo.save(brand);
  }

  async removeBrand(id: string): Promise<void> {
    const brand = await this.findBrand(id);
    await this.brandRepo.remove(brand);
  }
}
