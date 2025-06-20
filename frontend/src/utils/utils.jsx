import { useTranslation } from 'react-i18next';

export function useFormatPrice(price) {
    const { i18n } = useTranslation();

    if (i18n.language === 'pt') {
        return price.toString().replace('.', ',');
    }
    return price.toString();
}

export function formatPrice(price, language) {
    if (language === 'pt') {
        return price.toString().replace('.', ',');
    }
    return price.toString();
}
export function formatPriceValue(value, language) {
    const formatted = Number(value).toFixed(2);
    return language === 'pt' ? formatted.replace('.', ',') : formatted;
}
