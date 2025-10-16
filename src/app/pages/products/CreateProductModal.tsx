import * as Yup from 'yup';
import { Confirm, Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { HiOutlinePlus } from 'react-icons/hi';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Button, ModalFooter, Modal } from '../../components'
import productsService from '../../services/products.service';
import FormSelectBox from '../../components/FormSelectBox';
import IconButton from '../../components/IconButton';
import { useProducts } from '../../hooks/useProducts';

type Props = {
	product?: Product;
	showAddButton?: boolean;
	children?: React.ReactNode;
	onProductAdded?: () => void;
}

const CreateProductModal: FunctionComponent<PropsWithChildren<Props>> = ({ product, onProductAdded }) => {
	const { categories, reloadProducts } = useProducts()
	const [isOpenForm, setIsOpenForm] = useState(false);

	const [productValues, setProductValues] = useState<Product>({
		uuid: "",
		barcode: "",
		expirationDate: '',
		sellPrice: '0.00',
		costPrice: '0.00',
		categoryUuid: '',
		quantity: 0,
		name: '',
		minStock: '1',
		img: '',
		imagename: "",
		stock: 1,
		remove: ""
	} as Product);

	const newProductValidationSchema = Yup.object({
		categoryUuid: Yup.string()
			.required('Please select a category'),

		name: Yup.string()
			.required('Please enter product name'),

		barcode: Yup.string()
			.required('Product barcode is required')
			.matches(/^[0-9]+$/, 'Barcode must contain only numbers'),

		costPrice: Yup.number()
			.required('Price is required')
			.positive('Price must be greater than MK0'),

		sellPrice: Yup.number()
			.required('Price is required')
			.when('categoryUuid', {
				is: (categoryUuid: string) => categoryUuid === '-1',
				then: (schema) => schema.min(0, 'Price must be at least MK0'),
				otherwise: (schema) => schema.positive('Price must be greater than MK0')
			}),

		expirationDate: Yup.string()
			.required('Expiry date is required'),

		quantity: Yup.number()
			.required('Stock quantity is required')
			.min(0, 'Stock cannot be negative'),

		minStock: Yup.number()
			.required('Minimum stock is required')
			.min(1, 'Minimum stock must be at least 1'),

		imagename: Yup.mixed()
			.nullable()
			.test('fileSize', 'File size is too large', (value: File) => {
				if (!value) return true

				return value.size <= 2000000
			})
			.test('fileType', 'Unsupported file format', (value: File) => {
				if (!value) return true

				return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
			})
	})

	const handleAddProductClicked = () => {
		setIsOpenForm(!isOpenForm);
	}

	useEffect(() => {
		if (product) {
			setIsOpenForm(true);
			setProductValues({ ...product });
		}
	}, [product]);

	const handleSubmit = async (values: Product) => {
		try {
			const data = {
				...values,
				costPrice: values.costPrice.toString(),
				sellPrice: values.sellPrice.toString(),
				promoPrice: product?.uuid ? values.promoPrice.toString() : "0.00",
				stock: values.stock,
				minStock: values.minStock.toString(),
				quantity: values.quantity,
			}

			if (productValues?.uuid) {
				await productsService.update(productValues?.uuid?.toString(), data);
			} else {
				await productsService.store(data);
			}

			reloadProducts()
			onProductAdded && onProductAdded();

			const diagOptions = {
				title: "Product Saved",
				text: "Select an option below to continue.",
				okButtonText: "Add another",
				cancelButtonText: "Close",
			};

			Confirm.show(
				diagOptions.title,
				diagOptions.text,
				diagOptions.okButtonText,
				diagOptions.cancelButtonText,
				() => ({}),
				() => {
					setIsOpenForm(false);
				},
			);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			Notify.failure('Error saving product:' + errorMessage);
		} finally {
			values.uuid = ''
			values.name = ''
			values.stock = 1
			values.quantity = 0
			values.barcode = ''
			values.categoryUuid = ''
			values.minStock = '1'
			values.sellPrice = '0.00'
			values.costPrice = '0.00'
			values.expirationDate = ''
		}
	}

	return (
		<Fragment>
			<IconButton
				color='bg-blue-600'
				className='rounded-r-sm rounded-l-none'
				onClick={handleAddProductClicked}
				icon={<HiOutlinePlus className='w-5 h-5' />}
			/>

			<Modal
				title='Product'
				isOpen={isOpenForm}
				onClose={handleAddProductClicked}
				className='max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
			>
				<Formik
					initialValues={productValues}
					validationSchema={newProductValidationSchema}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting, values, setFieldValue }) => (
						<Form>
							<FormWrapper>
								<FormSelectBox
									label="Category"
									name="categoryUuid"
									required
									options={categories.map((category: Category) => ({
										value: category.uuid.toString(),
										label: category.name as string
									}))}
								/>

								<div className='flex gap-2'>
									<FormInput
										label="Product Name"
										id="productName"
										name="name"
										type="text"
										required
										placeholder="Enter a product name"
										className="mt-1"
									/>

									<FormInput
										label="Barcode"
										id="barcode"
										name="barcode"
										type="text"
										required
										placeholder="Enter product barcode"
										className="mt-1"
										onChange={(e) => {
											const value = e.target.value;
											const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
											setFieldValue('barcode', cleanedValue);
										}}
									/>
								</div>

								<div className='flex gap-2'>
									<FormInput
										label="Purchase Price"
										name="costPrice"
										type="number"
										required
										placeholder="Purchase Price"
										className="mt-1"
									/>

									<FormInput
										label="Selling Price"
										name="sellPrice"
										type="number"
										required
										readOnly={values?.categoryUuid === "-1"}
										placeholder="Selling Price"
										className="mt-1"
									/>
								</div>

								<div className='flex gap-2'>
									<FormInput
										label="Stock"
										name="quantity"
										type="number"
										required
										placeholder="Available stock"
										className="mt-1"
										min="0"
									/>

									<FormInput
										label="Minimum Stock"
										name="minStock"
										type="number"
										required
										placeholder="Minimum Stock"
										className="mt-1"
										min="1"
									/>
								</div>

								<div className='flex gap-2'>
									<FormInput
										label="Expiry Date"
										name="expirationDate"
										type="date"
										required
										placeholderText="dd/mm/yyyy"
										className="mt-1"
									/>

									<FormInput
										type='checkbox'
										label="Enable stock check"
										name="stock"
										className="mt-1"
									/>
								</div>
							</FormWrapper>

							<ModalFooter className='mb-0 border-t mt-4'>
								<Button type="submit" block={true} loading={isSubmitting}>
									Submit
								</Button>
							</ModalFooter>
						</Form>
					)}
				</Formik>
			</Modal>
		</Fragment>
	)
}

export default CreateProductModal