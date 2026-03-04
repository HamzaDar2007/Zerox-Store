import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Attribute } from './entities/attribute.entity';
import { AttributeOption } from './entities/attribute-option.entity';
import { AttributeGroup } from './entities/attribute-group.entity';
import { CategoryAttribute } from './entities/category-attribute.entity';
import { BrandCategory } from './entities/brand-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeOption)
    private attributeOptionRepository: Repository<AttributeOption>,
    @InjectRepository(AttributeGroup)
    private attributeGroupRepository: Repository<AttributeGroup>,
    @InjectRepository(CategoryAttribute)
    private categoryAttributeRepository: Repository<CategoryAttribute>,
    @InjectRepository(BrandCategory)
    private brandCategoryRepository: Repository<BrandCategory>,
  ) {}

  // ==================== CATEGORY CRUD ====================

  async createCategory(dto: CreateCategoryDto): Promise<ServiceResponse<Category>> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create(dto);
    const savedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully',
      data: savedCategory,
    };
  }

  async findAllCategories(): Promise<ServiceResponse<Category[]>> {
    const categories = await this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async findRootCategories(): Promise<ServiceResponse<Category[]>> {
    const categories = await this.categoryRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return {
      success: true,
      message: 'Root categories retrieved successfully',
      data: categories,
    };
  }

  async findOneCategory(id: string): Promise<ServiceResponse<Category>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async findCategoryBySlug(slug: string): Promise<ServiceResponse<Category>> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<ServiceResponse<Category>> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    Object.assign(category, dto);
    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async removeCategory(id: string): Promise<ServiceResponse<void>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children && category.children.length > 0) {
      throw new ConflictException('Cannot delete category with children');
    }

    await this.categoryRepository.remove(category);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  // ==================== BRAND CRUD ====================

  async createBrand(dto: CreateBrandDto): Promise<ServiceResponse<Brand>> {
    const existingBrand = await this.brandRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingBrand) {
      throw new ConflictException('Brand with this slug already exists');
    }

    const brand = this.brandRepository.create(dto);
    const savedBrand = await this.brandRepository.save(brand);

    return {
      success: true,
      message: 'Brand created successfully',
      data: savedBrand,
    };
  }

  async findAllBrands(): Promise<ServiceResponse<Brand[]>> {
    const brands = await this.brandRepository.find({
      order: { name: 'ASC' },
    });

    return {
      success: true,
      message: 'Brands retrieved successfully',
      data: brands,
    };
  }

  async findOneBrand(id: string): Promise<ServiceResponse<Brand>> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return {
      success: true,
      message: 'Brand retrieved successfully',
      data: brand,
    };
  }

  async findBrandBySlug(slug: string): Promise<ServiceResponse<Brand>> {
    const brand = await this.brandRepository.findOne({
      where: { slug },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return {
      success: true,
      message: 'Brand retrieved successfully',
      data: brand,
    };
  }

  async updateBrand(id: string, dto: UpdateBrandDto): Promise<ServiceResponse<Brand>> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    Object.assign(brand, dto);
    const updatedBrand = await this.brandRepository.save(brand);

    return {
      success: true,
      message: 'Brand updated successfully',
      data: updatedBrand,
    };
  }

  async removeBrand(id: string): Promise<ServiceResponse<void>> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepository.remove(brand);

    return {
      success: true,
      message: 'Brand deleted successfully',
    };
  }

  // ==================== ATTRIBUTE CRUD ====================

  async createAttribute(dto: CreateAttributeDto): Promise<ServiceResponse<Attribute>> {
    // Auto-generate slug from name if not provided
    if (!dto.slug) {
      dto.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    const attribute = this.attributeRepository.create(dto);
    const savedAttribute = await this.attributeRepository.save(attribute);

    return {
      success: true,
      message: 'Attribute created successfully',
      data: savedAttribute,
    };
  }

  async findAllAttributes(): Promise<ServiceResponse<Attribute[]>> {
    const attributes = await this.attributeRepository.find({
      relations: ['options', 'attributeGroup'],
      order: { name: 'ASC' },
    });

    return {
      success: true,
      message: 'Attributes retrieved successfully',
      data: attributes,
    };
  }

  async findOneAttribute(id: string): Promise<ServiceResponse<Attribute>> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['options', 'attributeGroup'],
    });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    return {
      success: true,
      message: 'Attribute retrieved successfully',
      data: attribute,
    };
  }

  async updateAttribute(id: string, dto: UpdateAttributeDto): Promise<ServiceResponse<Attribute>> {
    const attribute = await this.attributeRepository.findOne({ where: { id } });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    Object.assign(attribute, dto);
    const updatedAttribute = await this.attributeRepository.save(attribute);

    return {
      success: true,
      message: 'Attribute updated successfully',
      data: updatedAttribute,
    };
  }

  async removeAttribute(id: string): Promise<ServiceResponse<void>> {
    const attribute = await this.attributeRepository.findOne({ where: { id } });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    await this.attributeRepository.remove(attribute);

    return {
      success: true,
      message: 'Attribute deleted successfully',
    };
  }

  // ==================== CATEGORY-BRAND ASSOCIATIONS ====================

  async assignBrandToCategory(categoryId: string, brandId: string): Promise<ServiceResponse<void>> {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const brand = await this.brandRepository.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');

    const existing = await this.brandCategoryRepository.findOne({
      where: { categoryId, brandId },
    });

    if (existing) {
      throw new ConflictException('Brand is already assigned to this category');
    }

    const brandCategory = this.brandCategoryRepository.create({ categoryId, brandId });
    await this.brandCategoryRepository.save(brandCategory);

    return {
      success: true,
      message: 'Brand assigned to category successfully',
    };
  }

  async removeBrandFromCategory(categoryId: string, brandId: string): Promise<ServiceResponse<void>> {
    const brandCategory = await this.brandCategoryRepository.findOne({
      where: { categoryId, brandId },
    });

    if (!brandCategory) {
      throw new NotFoundException('Brand is not assigned to this category');
    }

    await this.brandCategoryRepository.remove(brandCategory);

    return {
      success: true,
      message: 'Brand removed from category successfully',
    };
  }
}
