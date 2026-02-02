// File: client/src/utils/format.ts
export const formatCurrency = (amount: number | undefined | null) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};