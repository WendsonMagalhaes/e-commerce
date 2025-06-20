import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

describe('ProductsService', () => {
    let productsService: ProductsService;
    let httpService: Partial<HttpService>;
    let configService: Partial<ConfigService>;

    beforeEach(async () => {
        httpService = {
            get: jest.fn(),
        };
        configService = {
            get: jest.fn().mockReturnValue('fake_access_key'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                { provide: HttpService, useValue: httpService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        productsService = module.get<ProductsService>(ProductsService);
    });

    describe('fetchFallbackImage', () => {
        it('deve retornar URL da imagem quando a API retorna resultados', async () => {
            const mockResponse = {
                data: { results: [{ urls: { small: 'http://img.url/small.jpg' } }] },
            };
            (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

            const url = await (productsService as any).fetchFallbackImage('query');

            expect(url).toBe('http://img.url/small.jpg');
            expect(httpService.get).toHaveBeenCalledWith(
                'https://api.unsplash.com/search/photos',
                expect.objectContaining({
                    params: expect.objectContaining({ query: 'query' }),
                    headers: expect.objectContaining({
                        Authorization: 'Client-ID fake_access_key',
                    }),
                }),
            );
        });

        it('deve retornar URL padrão quando API não retorna resultados', async () => {
            const mockResponse = { data: { results: [] } };
            (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

            const url = await (productsService as any).fetchFallbackImage('query');

            expect(url).toBe(
                'https://www.malhariapradense.com.br/wp-content/uploads/2017/08/produto-sem-imagem.png',
            );
        });

        it('deve retornar URL padrão em caso de erro na requisição', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            (httpService.get as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));

            const url = await (productsService as any).fetchFallbackImage('query');

            expect(url).toBe(
                'https://www.malhariapradense.com.br/wp-content/uploads/2017/08/produto-sem-imagem.png',
            );

            (console.error as jest.Mock).mockRestore();
        });
    });


    describe('fetchBrazilianProducts', () => {
        it('deve retornar lista formatada de produtos brasileiros', async () => {
            const mockApiResponse = {
                data: [
                    {
                        id: '1',
                        nome: 'Prod 1',
                        descricao: 'desc',
                        categoria: 'cat1',
                        departamento: 'dep1',
                        preco: '10',
                        material: 'mat1',
                    },
                ],
            };
            (httpService.get as jest.Mock).mockReturnValueOnce(of(mockApiResponse));
            (httpService.get as jest.Mock).mockReturnValueOnce(
                of({ data: { results: [{ urls: { small: 'img.jpg' } }] } }),
            );

            const result = await (productsService as any).fetchBrazilianProducts();

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: '1',
                name: 'Prod 1',
                description: 'desc',
                category: 'cat1',
                department: 'dep1',
                gallery: ['img.jpg'],
                provider: 'brazilian',
            });
        });
    });

    describe('fetchEuropeanProducts', () => {
        it('deve retornar lista formatada de produtos europeus', async () => {
            const mockApiResponse = {
                data: [
                    {
                        id: '2',
                        name: 'Prod EU',
                        description: 'desc eu',
                        details: { adjective: 'cat2', material: 'mat2' },
                        hasDiscount: true,
                        discountValue: 5,
                    },
                ],
            };
            (httpService.get as jest.Mock).mockReturnValueOnce(of(mockApiResponse));
            (httpService.get as jest.Mock).mockReturnValueOnce(
                of({ data: { results: [{ urls: { small: 'imgEu.jpg' } }] } }),
            );

            const result = await (productsService as any).fetchEuropeanProducts();

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: '2',
                name: 'Prod EU',
                description: 'desc eu',
                category: 'cat2',
                gallery: ['imgEu.jpg'],
                provider: 'european',
                hasDiscount: true,
                discountValue: 5,
            });
        });
    });

    describe('getAllUnifiedProducts', () => {
        it('deve juntar produtos brasileiros e europeus', async () => {
            const brazilian = [
                {
                    id: '1',
                    provider: 'brazilian',
                    name: 'B Product',
                    description: '',
                    category: 'cat',
                    department: 'dep',
                    gallery: ['img1.jpg'],
                    price: '10',
                    material: 'mat',
                    hasDiscount: false,
                    discountValue: 0,
                },
            ];
            const european = [
                {
                    id: '2',
                    provider: 'european',
                    name: 'E Product',
                    description: '',
                    category: 'cat2',
                    department: '',
                    gallery: ['img2.jpg'],
                    price: '20',
                    material: 'mat2',
                    hasDiscount: true,
                    discountValue: 3,
                },
            ];

            jest.spyOn(productsService as any, 'fetchBrazilianProducts').mockResolvedValue(brazilian);
            jest.spyOn(productsService as any, 'fetchEuropeanProducts').mockResolvedValue(european);

            const result = await productsService.getAllUnifiedProducts();

            expect(result).toHaveLength(2);
            expect(result).toEqual([...brazilian, ...european]);
        });
    });

    describe('getProductUnifiedById', () => {
        it('deve retornar produto da lista unificada se encontrado', async () => {
            const product = {
                id: '1',
                provider: 'brazilian' as 'brazilian',
                name: 'Prod 1',
                description: 'desc',
                category: 'cat',
                department: 'dep',
                gallery: ['img1.jpg'],
                price: '10',
                material: 'mat',
                hasDiscount: false,
                discountValue: 0,
            };
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue([product]);
            jest.spyOn(productsService, 'getProductById').mockResolvedValue(null);

            const result = await productsService.getProductUnifiedById('brazilian', '1');

            expect(result).toEqual(product);
        });

        it('deve chamar getProductById se não encontrar no unificado', async () => {
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue([]);
            const fallbackProduct = {
                id: '2',
                provider: 'brazilian' as 'brazilian',
                name: 'Fallback',
                description: '',
                category: '',
                department: '',
                gallery: [],
                price: '0',
                material: '',
                hasDiscount: false,
                discountValue: 0,
            };
            jest.spyOn(productsService, 'getProductById').mockResolvedValue(fallbackProduct);

            const result = await productsService.getProductUnifiedById('brazilian', '2');

            expect(result).toEqual(fallbackProduct);
        });

        it('deve retornar null se produto não existir', async () => {
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue([]);
            jest.spyOn(productsService, 'getProductById').mockResolvedValue(null);

            const result = await productsService.getProductUnifiedById('invalid', '999');

            expect(result).toBeNull();
        });
    });

    describe('getProductById', () => {
        it('deve retornar produto brasileiro formatado', async () => {
            const apiResponse = {
                data: {
                    id: '1',
                    nome: 'nome',
                    descricao: 'desc',
                    categoria: 'cat',
                    departamento: 'dep',
                    preco: '10',
                    material: 'mat',
                    imagem: 'img.jpg',
                },
            };
            (httpService.get as jest.Mock).mockReturnValue(of(apiResponse));

            const result = await productsService.getProductById('brazilian', '1');

            expect(result).toMatchObject({
                id: '1',
                name: 'nome',
                description: 'desc',
                category: 'cat',
                department: 'dep',
                price: '10',
                material: 'mat',
                provider: 'brazilian',
            });
        });

        it('deve retornar produto europeu formatado', async () => {
            const apiResponse = {
                data: {
                    id: '2',
                    name: 'nomeEU',
                    description: 'descEU',
                    details: { adjective: 'catEU', material: 'matEU' },
                    gallery: ['img1.jpg'],
                    price: '20',
                    hasDiscount: true,
                    discountValue: 3,
                },
            };
            (httpService.get as jest.Mock).mockReturnValue(of(apiResponse));

            const result = await productsService.getProductById('european', '2');

            expect(result).toMatchObject({
                id: '2',
                name: 'nomeEU',
                description: 'descEU',
                category: 'catEU',
                gallery: ['img1.jpg'],
                price: '20',
                material: 'matEU',
                provider: 'european',
                hasDiscount: true,
                discountValue: 3,
            });
        });

        it('deve retornar null para provider inválido', async () => {
            const result = await productsService.getProductById('invalid' as any, '1');
            expect(result).toBeNull();
        });

        it('deve retornar null se API não retornar produto', async () => {
            (httpService.get as jest.Mock).mockReturnValue(of({ data: null }));

            const result = await productsService.getProductById('brazilian', '999');

            expect(result).toBeNull();
        });
    });

    describe('searchProducts', () => {
        const sampleProducts = [
            {
                name: 'Produto A',
                category: 'Cat1',
                material: 'Mat1',
                provider: 'brazilian',
                department: 'Dept1',
                price: '10',
            },
            {
                name: 'Produto B',
                category: 'Cat2',
                material: 'Mat2',
                provider: 'european',
                department: 'Dept2',
                price: '20',
            },
        ];

        beforeEach(() => {
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(sampleProducts as any);
        });

        it('deve filtrar por nome', async () => {
            const result = await productsService.searchProducts({ name: 'produto a' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Produto A');
        });

        it('deve filtrar por categoria', async () => {
            const result = await productsService.searchProducts({ category: 'cat2' });
            expect(result).toHaveLength(1);
            expect(result[0].category).toBe('Cat2');
        });

        it('deve filtrar por material', async () => {
            const result = await productsService.searchProducts({ material: 'mat1' });
            expect(result).toHaveLength(1);
            expect(result[0].material).toBe('Mat1');
        });

        it('deve filtrar por provider', async () => {
            const result = await productsService.searchProducts({ provider: 'european' });
            expect(result).toHaveLength(1);
            expect(result[0].provider).toBe('european');
        });

        it('deve filtrar por departamento', async () => {
            const result = await productsService.searchProducts({ department: 'dept1' });
            expect(result).toHaveLength(1);
            expect(result[0].department).toBe('Dept1');
        });

        it('deve filtrar por faixa de preço', async () => {
            const result = await productsService.searchProducts({ minPrice: 15 });
            expect(result).toHaveLength(1);
            expect(result[0].price).toBe('20');

            const result2 = await productsService.searchProducts({ maxPrice: 15 });
            expect(result2).toHaveLength(1);
            expect(result2[0].price).toBe('10');
        });

        it('deve retornar todos se filtro vazio', async () => {
            const result = await productsService.searchProducts({});
            expect(result).toHaveLength(2);
        });
    });

    describe('getAllCategories', () => {
        it('deve retornar lista única de categorias', async () => {
            const products = [
                { category: 'Cat1' },
                { category: 'Cat2' },
                { category: 'Cat1' },
                { category: null },
            ];
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(products as any);

            const result = await productsService.getAllCategories();
            expect(result).toEqual(['Cat1', 'Cat2']);
        });
    });

    describe('getAllMaterials', () => {
        it('deve retornar lista única de materiais', async () => {
            const products = [
                { material: 'Mat1' },
                { material: 'Mat2' },
                { material: 'Mat1' },
                { material: null },
            ];
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(products as any);

            const result = await productsService.getAllMaterials();
            expect(result).toEqual(['Mat1', 'Mat2']);
        });
    });

    describe('getAllDepartments', () => {
        it('deve retornar lista única de departamentos', async () => {
            const products = [
                { department: 'Dept1' },
                { department: 'Dept2' },
                { department: 'Dept1' },
                { department: null },
            ];
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(products as any);

            const result = await productsService.getAllDepartments();
            expect(result).toEqual(['Dept1', 'Dept2']);
        });
    });

    describe('getAllNames', () => {
        it('deve retornar lista única de nomes', async () => {
            const products = [
                { name: 'Name1' },
                { name: 'Name2' },
                { name: 'Name1' },
                { name: null },
            ];
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(products as any);

            const result = await productsService.getAllNames();
            expect(result).toEqual(['Name1', 'Name2']);
        });
    });

    describe('getAllDescription', () => {
        it('deve retornar lista única de descrições', async () => {
            const products = [
                { description: 'Desc1' },
                { description: 'Desc2' },
                { description: 'Desc1' },
                { description: null },
            ];
            jest.spyOn(productsService, 'getAllUnifiedProducts').mockResolvedValue(products as any);

            const result = await productsService.getAllDescription();
            expect(result).toEqual(['Desc1', 'Desc2']);
        });
    });
});
