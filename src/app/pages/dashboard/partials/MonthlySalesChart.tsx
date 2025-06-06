import { formatCurrency } from '../../../utils';
import { Fragment, type FunctionComponent, type ReactElement, } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const MonthlySalesChart: FunctionComponent<{ data: Array<MonthlySales>; chartHeader: ReactElement }> = ({ data, chartHeader }) => {
	const CustomizedLabel = (props) => {
		const { x, y, width, height, value } = props;
		return (
			<text
				x={x + width / 2}
				y={y + height / 2}
				fill="#000"
				textAnchor="middle"
				dominantBaseline="middle"
				fontSize="14"
				fontWeight="bold"
				transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`}
			>
				{formatCurrency(value)}
			</text>
		);
	};

	return (
		<Fragment>
			<div className="flex items-center justify-between gap-2 mb-2 py-4 border-b">
				{chartHeader}
			</div>

			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					barSize={30}
					margin={{ top: 10, right: 0, left: 10, bottom: 8 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
					<XAxis
						dataKey="date"
						angle={-45}
						textAnchor="end"
						height={100}
						fontSize={12}
						stroke="#666"
						type='category'
						scale="point"
						padding={{ left: 10, right: 10 }}
						label="Date"
					/>
					<YAxis
						label={{ value: 'Amount in MWK', angle: -90, position: "left" }}
						fontSize={12}
						stroke="#666"
						type='number'
					/>
					<Bar dataKey="totalAmount" radius={[2, 2, 0, 0]} fill='#bae6fd'>
						<LabelList content={CustomizedLabel} />
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Fragment>
	)
}

export default MonthlySalesChart