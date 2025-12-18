import * as Yup from 'yup';
import { Confirm, Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { HiOutlinePlus } from 'react-icons/hi';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Button, ModalFooter, Modal } from '../../components'
import inventoryService from '../../services/inventory.service';
import FormSelectBox from '../../components/FormSelectBox';
import IconButton from '../../components/IconButton';
import { useInventory } from '../../hooks/useInventory';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';

type Props = {
	item?: InventoryItem;
	showAddButton?: boolean;
	children?: React.ReactNode;
	onItemAdded?: () => void;
}

const CreateInventoryModal: FunctionComponent<PropsWithChildren<Props>> = ({ item, onItemAdded }) => {
	const { reloadInventory } = useInventory()
	const { categories } = useInventoryManagement()
	const [isOpenForm, setIsOpenForm] = useState(false);

	const [itemValues, setItemValues] = useState<Partial<InventoryItem>>({
		productId: "",
		barcode: "",
		expirationDate: '',
		sellPrice: 0,
		costPrice: 0,
		categoryId: '',
		quantity: '0',
		originalQuantity: '0',
		name: '',
		minStock: 1,
		stock: 1,
	});

	const newItemValidationSchema = Yup.object({
		categoryId: Yup.string()
			.required('Please select a category'),

		name: Yup.string()
			.required('Please enter item name'),

		barcode: Yup.string()
			.required('Barcode is required')
			.matches(/^[0-9]+$/, 'Barcode must contain only numbers'),

		costPrice: Yup.number()
			.required('Cost price is required')
			.positive('Price must be greater than 0'),

		sellPrice: Yup.number()
			.required('Sell price is required')
			.when('categoryId', {
				is: (categoryId: string) => categoryId === '-1',
				then: (schema) => schema.min(0, 'Price must be at least 0'),
				otherwise: (schema) => schema.positive('Price must be greater than 0')
			}),

		expirationDate: Yup.string()
			.required('Expiry date is required'),

		quantity: Yup.number()
			.required('Stock quantity is required')
			.min(0, 'Stock cannot be negative'),

		minStock: Yup.number()
			.required('Minimum stock is required')
			.min(1, 'Minimum stock must be at least 1'),
	})

	const handleAddItemClicked = () => {
		setIsOpenForm(!isOpenForm);
	}

	useEffect(() => {
		if (item) {
			setIsOpenForm(true);
			setItemValues({ ...item });
		}
	}, [item]);

	const handleSubmit = async (values: Partial<InventoryItem>) => {
		try {
			const data = {
				...values,
				costPrice: Number(values.costPrice),
				sellPrice: Number(values.sellPrice),
				promoPrice: item?.productId ? Number(values.promoPrice) : 0,
				stock: values.stock,
				minStock: Number(values.minStock),
				quantity: values.quantity?.toString() || '0',
				originalQuantity: values.originalQuantity?.toString() || values.quantity?.toString() || '0',
			} as InventoryItem

			if (itemValues?.productId) {
				await inventoryService.update(itemValues?.productId?.toString(), data);
			} else {
				await inventoryService.store(data);
			}

			reloadInventory()
			onItemAdded && onItemAdded();

			const diagOptions = {
				title: "Item Saved",
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
			Notify.failure('Error saving item: ' + errorMessage);
		} finally {
			values.productId = ''
			values.name = ''
			values.stock = 1
			values.quantity = '0'
			values.barcode = ''
			values.categoryId = ''
			values.minStock = 1
			values.sellPrice = 0
			values.costPrice = 0
			values.expirationDate = ''
		}
	}

	return (
		<Fragment>
			<IconButton
				color=''
				className='rounded-r-sm rounded-l-none'
				onClick={handleAddItemClicked}
				icon={<HiOutlinePlus className='w-5 h-5 text-blue-600' />}
			/>

			<Modal
				title='Inventory Item'
				isOpen={isOpenForm}
				onClose={handleAddItemClicked}
				className='max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
			>
				<Formik
					initialValues={itemValues}
					validationSchema={newItemValidationSchema}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting, values, setFieldValue }) => (
						<Form>
							<FormWrapper>
								<FormSelectBox
									label="Category"
									name="categoryId"
									required
									options={categories.map((category: Category) => ({
										value: category.categoryId.toString(),
										label: category.name as string
									}))}
								/>

								<div className='flex gap-2'>
									<FormInput
										label="Item Name"
										id="itemName"
										name="name"
										type="text"
										required
										placeholder="Enter item name"
										className="mt-1"
									/>

									<FormInput
										label="Barcode"
										id="barcode"
										name="barcode"
										type="text"
										required
										placeholder="Enter barcode"
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
										label="Cost Price"
										name="costPrice"
										type="number"
										required
										placeholder="Cost Price"
										className="mt-1"
									/>

									<FormInput
										label="Sell Price"
										name="sellPrice"
										type="number"
										required
										readOnly={values?.categoryId === "-1"}
										placeholder="Sell Price"
										className="mt-1"
									/>
								</div>

								<div className='flex gap-2'>
									<FormInput
										label="Quantity"
										name="quantity"
										type="number"
										required
										placeholder="Available quantity"
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
										label="Track inventory"
										name="trackInventory"
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

export default CreateInventoryModal