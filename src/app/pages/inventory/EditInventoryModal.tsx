import * as Yup from 'yup';
import { Confirm, Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Button, ModalFooter, Modal } from '../../components'
import inventoryService from '../../services/inventory.service';
import FormSelectBox from '../../components/FormSelectBox';
import { useInventory } from '../../hooks/useInventory';
import { DEFAULT_SEED_KEY } from '../../constants';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';

type Props = {
	item: InventoryItem;
	showAddButton?: boolean;
	children?: React.ReactNode;
	onItemUpdate: () => void;
}

const EditInventoryModal: FunctionComponent<PropsWithChildren<Props>> = ({ item, onItemUpdate }) => {
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

	const updateItemValidationSchema = Yup.object({
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
				is: (categoryId: string) => (categoryId) === DEFAULT_SEED_KEY,
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

	const handleEditItemClicked = () => {
		setIsOpenForm(!isOpenForm);
	}

	useEffect(() => {
		if (item) {
			setIsOpenForm(true);
			setItemValues({ ...item });
		}
	}, [item]);

	const handleUpdate = async (values: Partial<InventoryItem>) => {
		try {
			const data = {
				...values,
				productId: values.productId?.toString(),
				barcode: values.barcode?.toString() || '',
				costPrice: Number(values.costPrice),
				sellPrice: Number(values.sellPrice),
				promoPrice: item?.productId ? Number(values.promoPrice) : 0,
				stock: values.stock,
				minStock: Number(values.minStock),
				quantity: values.quantity?.toString() || '0',
				originalQuantity: values.originalQuantity?.toString() || '0',
			} as InventoryItem

			await inventoryService.update(itemValues?.productId?.toString() || '', data);

			reloadInventory()
			onItemUpdate && onItemUpdate();

			const diagOptions = {
				title: "Item Updated",
				text: "Select an option below to continue.",
				okButtonText: "Edit another",
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
			Notify.failure('Error updating item: ' + errorMessage);
		} finally {
			values.productId = ''
		}
	}

	return (
		<Fragment>
			<Modal
				title='Edit Inventory Item'
				isOpen={isOpenForm}
				onClose={handleEditItemClicked}
				className='max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
			>
				<Formik
					initialValues={itemValues}
					validationSchema={updateItemValidationSchema}
					onSubmit={handleUpdate}
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
										readOnly={values?.categoryId === DEFAULT_SEED_KEY}
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

export default EditInventoryModal