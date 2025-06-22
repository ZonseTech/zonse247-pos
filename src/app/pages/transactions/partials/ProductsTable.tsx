import { type FunctionComponent, useContext } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { ZonseThemeContext } from "../../../components";
import { formatCurrency } from "../../../utils";

interface Props {
	soldProducts: CartItem[];
}

const ProductsTable: FunctionComponent<Props> = ({ soldProducts }) => {
	const { mode } = useContext(ZonseThemeContext);

	const columns: TableColumn<CartItem>[] = [
		{
			name: "Barcode",
			selector: (row) => row.barcode || '-',
		},
		{
			name: "Name",
			selector: (row) => row.name,
		},
		{
			name: "Category",
			selector: (row) => row.categoryDetails.name || '-',
		},
		{
			name: "Sell Price",
			selector: (row) => formatCurrency(row.sellPrice),
		},
		{
			name: "Cost Price",
			selector: (row) => formatCurrency(row.purchasePrice),
		},
		{
			name: "Quantity",
			selector: (row) => row.quantity,
		},
	];

	return (
		<div className="bg-white dark:bg-gray-700 rounded-md p-4 mt-4">
			<div className="flex justify-between items-center pb-4 border-b">
				<div>
					<h2 className="text-xl uppercase font-medium text-gray-700 flex-1">
						Products Sold
					</h2>
				</div>
			</div>

			<div className="uppercase">
				<DataTable
					columns={columns}
					data={soldProducts}
					theme={mode as string}
					highlightOnHover
					striped
					responsive
					pagination
					fixedHeader
					fixedHeaderScrollHeight="calc(100vh - 350px)"
				/>
			</div>
		</div>
	);
};

export default ProductsTable;