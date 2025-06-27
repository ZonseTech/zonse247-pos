import { Input, Select } from '../../../components';
import { FunctionComponent, PropsWithChildren } from 'react'

type Props = {
    searchValue: string;
    categories: Category[];
    handleSearch: (searchTerm: string) => void;
    handleCategory: (category: number) => void;
}

const ProductFilter: FunctionComponent<PropsWithChildren<Props>> = ({ categories, searchValue, handleSearch, handleCategory }) => {

    return (
        <div className="flex mb-4 pb-4 border-b space-x-4">
            <Input
                type="text"
                placeholder="Search product by name or sku"
                value={searchValue}
                onChange={(e) => {
                    const value = e.target.value;
                    const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;

                    handleSearch(cleanedValue)
                }}
            />
            <Select
                onChange={(e) => handleCategory(parseFloat(e.target.value))}
            >
                <option value=''>All categories</option>

                {categories.map((cat) => (
                    <option key={cat.name as string} value={cat.uuid}>
                        {cat.name as string}
                    </option>
                ))}

            </Select>
        </div>
    )
}

export default ProductFilter