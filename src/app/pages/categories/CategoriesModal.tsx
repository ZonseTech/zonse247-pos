import { Input, Modal } from '../../components'
import SplitButton from '../../components/SplitButton'
import CreateCategoryModal from './CreateCategoryModal'
import { useProducts } from '../../context/ProductsProvider'
import categoriesSerive from '../../services/category.service'
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import { ChangeEvent, Fragment, FunctionComponent, useEffect, useState } from 'react'
import { HiOutlineFolderOpen, HiOutlineMenuAlt4, HiOutlinePencilAlt, HiOutlineSearch, HiOutlineTrash, HiOutlineViewList } from 'react-icons/hi'

const CategoriesModal: FunctionComponent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<Category[]>([]);
    const { categories, setCategories } = useProducts();
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [category, setCategory] = useState<Category>({} as Category);

    const handleAddCategoryClicked = async () => {
        setIsOpenForm(!isOpenForm);
        setData(categories);
    }

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setSearchTerm(value);

        if (value === "") {
            setData(categories);
        } else {
            const filteredCategories = categories.filter((category: Category) =>
                (category.name as string).toLowerCase().includes(value.toLowerCase())
            );
            setData(filteredCategories);
        }
    };

    const handleEditCategory = (cat: Category) => {
        if (cat.uuid) setCategory(cat);
    }

    const handleDeleteCategory = async (id: string) => {
        const diagOptions = {
            title: "Delete Category",
            text: "Are you sure you want to delete this category?",
            okButtonText: "Delete",
            cancelButtonText: "Cancel",
        };

        Confirm.show(
            diagOptions.title,
            diagOptions.text,
            diagOptions.okButtonText,
            diagOptions.cancelButtonText,
            async () => {
                try {
                    await categoriesSerive.delete(id);
                    const cats = data.filter((category) => category.uuid.toString() !== id)
                    setCategories(cats);
                    setData(cats);
                    setSearchTerm('')
                } catch (error) {
                    console.error(error);
                }
            },
        );
    }

    useEffect(() => {
        setData(categories)
    }, [categories])

    return (
        <Fragment>
            <SplitButton
                color='bg-green-400'
                iconColor='bg-green-500'
                text='Categories'
                onClick={handleAddCategoryClicked}
                icon={<HiOutlineViewList className='w-5 h-5' />}
                plusAction={<CreateCategoryModal />}
            />

            <Modal
                title='Categories'
                isOpen={isOpenForm}
                onClose={handleAddCategoryClicked}
                className='max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'>
                <div className="flex justify-between items-center pb-4 border-b">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="rounded-md px-3 py-2.5 pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100/50">
                            <tr>
                                {[
                                    {
                                        name: "Name",
                                    },
                                    {
                                        name: <HiOutlineMenuAlt4 className='w-5 h-5' />,
                                    },
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-2 py-4 text-left font-medium text-gray-600 capitalize tracking-wider"
                                    >
                                        {header.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-700">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100'}
                                    >
                                        <td className="px-2 py-4 border border-gray-50 capitalize tracking-wider">{row.name as string}</td>
                                        <td className="px-2 py-4 border border-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleEditCategory(row)}
                                                    className="text-green-500 hover:text-green-600"
                                                >
                                                    <HiOutlinePencilAlt className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(row.uuid.toString())}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <HiOutlineFolderOpen className="w-12 h-12 mb-2" />
                                            <p className="text-lg font-medium">No data available</p>
                                            <p className="text-sm">Add categories to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {category.uuid && <CreateCategoryModal category={category} showAddButton={false} />}
        </Fragment>
    )
}

export default CategoriesModal