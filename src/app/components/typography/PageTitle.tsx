import React, { type PropsWithChildren } from 'react'

const PageTitle: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<h1 className="my-6 text-2xl font-semibold text-gray-700">{children}</h1>
	)
}

export default PageTitle
