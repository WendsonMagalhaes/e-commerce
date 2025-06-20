import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UnifiedProduct } from './interfaces/unified-product.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
    private readonly UNSPLASH_ACCESS_KEY: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.UNSPLASH_ACCESS_KEY = this.configService.get<string>('UNSPLASH_ACCESS_KEY')!;
    }


    private async fetchFallbackImage(query: string): Promise<string> {
        try {
            const response = await lastValueFrom(
                this.httpService.get('https://api.unsplash.com/search/photos', {
                    params: {
                        query,
                        per_page: 1,
                        orientation: 'squarish',
                    },
                    headers: {
                        Authorization: `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
                    },
                }),
            );

            const results = response.data.results;
            if (results.length > 0) {
                return results[0].urls.small;
            }
        } catch (error) {
            console.error('Erro ao buscar imagem no Unsplash:', error.message);
        }

        return 'https://www.malhariapradense.com.br/wp-content/uploads/2017/08/produto-sem-imagem.png';
    }


    private async fetchBrazilianProducts(): Promise<UnifiedProduct[]> {
        const url = 'http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider';
        const response = await lastValueFrom(this.httpService.get(url));

        return Promise.all(
            response.data.map(async (product) => {
                const image = await this.fetchFallbackImage(product.nome || product.descricao);
                return {
                    id: product.id,
                    name: product.nome || product.name,
                    description: product.descricao || '',
                    category: product.categoria,
                    gallery: [image],
                    department: product.departamento,
                    price: product.preco,
                    material: product.material,
                    provider: 'brazilian',
                    hasDiscount: false,
                    discountValue: 0
                };
            }),
        );
    }

    private async fetchEuropeanProducts(): Promise<UnifiedProduct[]> {
        const url = 'http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider';
        const response = await lastValueFrom(this.httpService.get(url));
        return Promise.all(
            response.data.map(async (product) => {
                const image = await this.fetchFallbackImage(product.name);
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    category: product.details?.adjective,
                    department: '',
                    gallery: [image],
                    price: product.price,
                    material: product.details?.material,
                    provider: 'european',
                    hasDiscount: product.hasDiscount,
                    discountValue: product.discountValue
                };
            }),
        );
    }

    async getAllUnifiedProducts(): Promise<UnifiedProduct[]> {
        const [br, eu] = await Promise.all([
            this.fetchBrazilianProducts(),
            this.fetchEuropeanProducts(),
        ]);

        return [...br, ...eu];
    }
    async getProductUnifiedById(provider: string, id: string): Promise<UnifiedProduct | null> {
        const allProducts = await this.getAllUnifiedProducts();

        const found = allProducts.find(p => p.provider === provider && p.id === id);
        if (found) {
            return found;
        }

        return this.getProductById(provider, id);
    }

    async getProductById(provider: string, id: string): Promise<UnifiedProduct | null> {
        let url: string;

        if (provider === 'brazilian') {
            url = `http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider/${id}`;
            const response = await lastValueFrom(this.httpService.get(url));
            const product = response.data;
            if (!product) return null;
            return {
                id: product.id,
                name: product.nome || product.name,
                description: product.descricao || '',
                category: product.categoria,
                gallery: [product.imagem],
                department: product.departamento,
                price: product.preco,
                material: product.material,
                provider: 'brazilian',
                hasDiscount: false,
                discountValue: 0
            };
        } else if (provider === 'european') {
            url = `http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider/${id}`;
            const response = await lastValueFrom(this.httpService.get(url));
            const product = response.data;
            if (!product) return null;
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.details?.adjective,
                department: '',
                gallery: product.gallery,
                price: product.price,
                material: product.details?.material,
                provider: 'european',
                hasDiscount: product.hasDiscount,
                discountValue: product.discountValue
            };
        } else {
            return null;
        }
    }
    async searchProducts(filter: {
        name?: string;
        category?: string;
        material?: string;
        provider?: 'brazilian' | 'european';
        department?: string;
        minPrice?: number;
        maxPrice?: number;

    }): Promise<UnifiedProduct[]> {
        const allProducts = await this.getAllUnifiedProducts();

        return allProducts.filter(product => {
            const matchName = filter.name
                ? product.name.toLowerCase().includes(filter.name.toLowerCase())
                : true;

            const matchCategory = filter.category
                ? product.category?.toLowerCase().includes(filter.category.toLowerCase())
                : true;

            const matchMaterial = filter.material
                ? product.material?.toLowerCase().includes(filter.material.toLowerCase())
                : true;
            const matchDepartment = filter.department
                ? product.department?.toLowerCase().includes(filter.department.toLowerCase())
                : true;

            const matchProvider = filter.provider
                ? product.provider === filter.provider
                : true;

            const matchMinPrice = filter.minPrice !== undefined
                ? Number(product.price) >= filter.minPrice
                : true;

            const matchMaxPrice = filter.maxPrice !== undefined
                ? Number(product.price) <= filter.maxPrice
                : true;


            return matchName && matchCategory && matchMaterial && matchProvider && matchDepartment && matchMinPrice && matchMaxPrice;
        });
    }

    async getAllCategories(): Promise<string[]> {
        const products = await this.getAllUnifiedProducts();
        const categories = products
            .map(p => p.category)
            .filter((c): c is string => typeof c === 'string');

        return Array.from(new Set(categories));
    }

    async getAllMaterials(): Promise<string[]> {
        const products = await this.getAllUnifiedProducts();
        const materials = products
            .map(p => p.material)
            .filter((m): m is string => typeof m === 'string');

        return Array.from(new Set(materials));
    }

    async getAllDepartments(): Promise<string[]> {
        const products = await this.getAllUnifiedProducts();
        const departments = products
            .map(p => p.department)
            .filter((d): d is string => typeof d === 'string');

        return Array.from(new Set(departments));
    }

    async getAllNames(): Promise<string[]> {
        const products = await this.getAllUnifiedProducts();
        const names = products
            .map(p => p.name)
            .filter((d): d is string => typeof d === 'string');

        return Array.from(new Set(names));
    }
    async getAllDescription(): Promise<string[]> {
        const products = await this.getAllUnifiedProducts();
        const descriptions = products
            .map(p => p.description)
            .filter((d): d is string => typeof d === 'string');

        return Array.from(new Set(descriptions));
    }


}
