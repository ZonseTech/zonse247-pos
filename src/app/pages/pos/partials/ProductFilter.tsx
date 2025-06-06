import { Input } from '../../../components';
import { FunctionComponent, PropsWithChildren } from 'react'

type Props = {
    searchValue: string;
    categories: Category[];
    handleSearch: (searchTerm: string) => void;
    handleCategory: (category: number) => void;
}

const ProductFilter: FunctionComponent<PropsWithChildren<Props>> = ({ categories, searchValue, handleSearch, handleCategory }) => {

    return (
        <div className="flex mb-4 pb-4 border-b">
            <Input
                type="text"
                placeholder="Search product by name or sku"
                value={searchValue}
                onChange={(e) => {
                    const value = e.target.value;
                    const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;

                    handleSearch(cleanedValue)
                }}
                className="flex-grow flex-1 mr-2"
            />
            <select
                onChange={(e) => handleCategory(parseFloat(e.target.value))}
                className="p-2 flex-1 border rounded-sm border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-400"
            >
                <option value=''>All categories</option>

                {categories.map((cat) => (
                    <option key={cat.name as string} value={cat.uuid}>
                        {cat.name as string}
                    </option>
                ))}

            </select>
        </div>
    )
}

export default ProductFilter