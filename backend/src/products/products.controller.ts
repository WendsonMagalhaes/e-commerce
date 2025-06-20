import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { UnifiedProduct } from './interfaces/unified-product.interface';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async getAllUnifiedProducts() {
        return this.productsService.getAllUnifiedProducts();
    }

    @Get(':provider/:id')
    async getProductById(
        @Param('provider') provider: string,
        @Param('id') id: string,
    ): Promise<UnifiedProduct | { message: string }> {
        const product = await this.productsService.getProductById(provider, id);

        if (!product) {
            return { message: 'Product not found' };
        }
        return product;
    }
    @Get('unified/:provider/:id')
    async getProductUnifiedById(
        @Param('provider') provider: string,
        @Param('id') id: string,
    ): Promise<UnifiedProduct | { message: string }> {
        const product = await this.productsService.getProductUnifiedById(provider, id);

        if (!product) {
            return { message: 'Product not found' };
        }
        return product;
    }

    @Get('search')
    async search(
        @Query('name') name?: string,
        @Query('category') category?: string,
        @Query('material') material?: string,
        @Query('provider') provider?: 'brazilian' | 'european',
        @Query('department') department?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,

    ) {
        return this.productsService.searchProducts({ name, category, material, provider, department, minPrice: minPrice !== undefined ? Number(minPrice) : undefined, maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined, });
    }

    @Get('categories')
    async categories() {
        return this.productsService.getAllCategories();
    }

    @Get('materials')
    async materials() {
        return this.productsService.getAllMaterials();
    }

    @Get('departments')
    async departments() {
        return this.productsService.getAllDepartments();
    }
    @Get('names')
    async names() {
        return this.productsService.getAllNames();
    }
    @Get('descriptions')
    async descriptions() {
        return this.productsService.getAllDescription();
    }

}
