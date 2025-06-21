import * as Yup from 'yup';
import { Confirm, Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Button, ModalFooter, Modal } from '../../components'
import productsService from '../../services/products.service';
import FormSelectBox from '../../components/FormSelectBox';
import { useProducts } from '../../context/ProductsProvider';

type Props = {
	product: Product;
	showAddButton?: boolean;
	children?: React.ReactNode;
	onProductUpdate: () => void;
}

const EditProductModal: FunctionComponent<PropsWithChildren<Props>> = ({ product, onProductUpdate }) => {
	const { categories, reloadProducts } = useProducts()
	const [isOpenForm, setIsOpenForm] = useState(false);

	const [productValues, setProductValues] = useState<Product>({
		uuid: "",
		barcode: "",
		expirationDate: '',
		sellPrice: '0.00',
		costPrice: '0.00',
		categoryId: '',
		quantity: 0,
		name: '',
		minStock: '1',
		img: '',
		imagename: "",
		stock: 1,
		remove: ""
	} as Product);

	const updateProductValidationSchema = Yup.object({
		categoryId: Yup.string()
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
			.when('categoryId', {
				is: (categoryId: string) => (categoryId) === "1",
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

	const handleUpdate = async (values: Product) => {
		try {
			const data = {
				...values,
				uuid: values.uuid?.toString(),
				barcode: values.barcode.toString(),
				costPrice: values.costPrice.toString(),
				sellPrice: values.sellPrice.toString(),
				promoPrice: product?.uuid ? values.promoPrice.toString() : "0.00",
				stock: values.stock,
				minStock: values.minStock.toString(),
				quantity: values.quantity.toString(),
			}

			await productsService.update(productValues?.uuid?.toString(), data);

			reloadProducts()
			onProductUpdate && onProductUpdate();

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
		}
	}

	return (
		<Fragment>
			<Modal
				title='Product'
				isOpen={isOpenForm}
				onClose={handleAddProductClicked}
				className='max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
			>
				<Formik
					initialValues={productValues}
					validationSchema={updateProductValidationSchema}
					onSubmit={handleUpdate}
				>
					{({ isSubmitting, values, setFieldValue }) => (
						<Form>
							<FormWrapper>
								<input type="hidden" name="uuid" value="" />
								<input type="hidden" name="img" value="" />
								<input type="hidden" name="remove" value="" />

								<FormSelectBox
									label="Category"
									name="categoryId"
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
										readOnly={values?.categoryId === "1"}
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
									Update
								</Button>
							</ModalFooter>
						</Form>
					)}
				</Formik>
			</Modal>
		</Fragment>
	)
}

export default EditProductModal