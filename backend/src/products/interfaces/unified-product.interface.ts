export interface UnifiedProduct {
    id: string;
    name: string;
    description: string;
    category?: string;
    gallery: string[];
    price: string;
    material?: string;
    provider: 'brazilian' | 'european';
    department?: string;
    hasDiscount?: boolean;
    discountValue?: number
}
