import React, { type PropsWithChildren } from 'react'
import Card from './card/Card'
import CardBody from './card/CardBody'

type Props = {
	title: string,
	value: string
}

const InfoCard: React.FC<PropsWithChildren<Props>> = ({ title, value, children }) => {
	return (
		<Card className='rounded-md'>
			<CardBody className="flex items-center">
				{children}

				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					{value && <p className="mt-1.5 text-lg font-semibold text-gray-700">{value}</p>}
				</div>
			</CardBody>
		</Card>
	)
}

export default InfoCard
