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
				fill="currentColor"
				className="fill-gray-800 dark:fill-gray-200 transition-colors duration-200"
				textAnchor="middle"
				dominantBaseline="middle"
				fontSize="14"
				fontWeight="bold"
				transform={value === 0 ? "" : `rotate(-90, ${x + width / 2}, ${y + height / 2})`}
			>
				{(value === 0) ? '0' : formatCurrency(value)}
			</text>
		);
	};

	return (
		<Fragment>
			<div className="
				mb-4 py-4 px-2
				border-b border-gray-200 dark:border-gray-700
				bg-gradient-to-r from-gray-50/50 via-transparent to-gray-50/50
				dark:from-gray-800/30 dark:via-transparent dark:to-gray-800/30
				rounded-t-lg
				transition-all duration-200
			">
				{chartHeader}
			</div>

			<div className="
				rounded-lg
				border border-gray-200 dark:border-gray-700
				transition-all duration-200
				h-[39rem]
				hover:shadow-md dark:hover:shadow-2xl
			">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						barSize={30}
						margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
						className="transition-all duration-300"
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="currentColor"
							className="stroke-gray-300 dark:stroke-gray-600 opacity-50 dark:opacity-30"
						/>

						<XAxis
							dataKey="date"
							angle={-45}
							textAnchor="end"
							height={60}
							fontSize={12}
							stroke="currentColor"
							className="fill-gray-600 dark:fill-gray-400"
							type='category'
							scale="point"
							padding={{ left: 10, right: 10 }}
							label={{
								value: 'Date',
								position: 'insideBottom',
								offset: -0,
								className: 'fill-gray-700 dark:fill-gray-300'
							}}
							tick={{
								className: 'fill-gray-600 dark:fill-gray-400 transition-colors duration-200'
							}}
							axisLine={{
								stroke: 'currentColor',
								className: 'stroke-gray-400 dark:stroke-gray-500'
							}}
							tickLine={{
								stroke: 'currentColor',
								className: 'stroke-gray-400 dark:stroke-gray-500'
							}}
						/>

						<YAxis
							label={{
								value: 'Amount in MWK',
								angle: -90,
								position: "insideLeft",
								className: 'fill-gray-700 dark:fill-gray-300'
							}}
							fontSize={12}
							stroke="currentColor"
							className="fill-gray-600 dark:fill-gray-400"
							type='number'
							tick={{
								className: 'fill-gray-600 dark:fill-gray-400 transition-colors duration-200'
							}}
							axisLine={{
								stroke: 'currentColor',
								className: 'stroke-gray-400 dark:stroke-gray-500'
							}}
							tickLine={{
								stroke: 'currentColor',
								className: 'stroke-gray-400 dark:stroke-gray-500'
							}}
						/>

						<Bar
							dataKey="totalAmount"
							radius={[4, 4, 0, 0]}
							className="
								fill-blue-400 dark:fill-blue-500
								hover:fill-blue-500 dark:hover:fill-blue-400
								transition-all duration-300
								drop-shadow-sm dark:drop-shadow-lg
              				"
							style={{
								filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(59,130,246,0.2))'
							}}
						>
							<LabelList content={CustomizedLabel} />
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Fragment>
	)
}

export default MonthlySalesChart