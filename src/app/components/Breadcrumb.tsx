import React, { type PropsWithChildren } from 'react'

const Breadcrumb: React.FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
	return (
		<div
			className="flex items-center justify-between p-2.5 my-6 text-sm font-semibold text-sky-100 bg-sky-600 rounded focus:outline-none"
		>
			<div className="flex items-center capitalize">
				<span>{title}</span>
			</div>
			<div className='flex justify-center items-center space-x-3'>
				{children}
			</div>
		</div>
	)
}

export default Breadcrumb