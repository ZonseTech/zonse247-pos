import React, { type PropsWithChildren } from 'react'

const SectionTitle: React.FC<PropsWithChildren> = ({ children }) => {
	return <h2 className="mb-4 text-lg font-semibold text-gray-600">{children}</h2>
}

export default SectionTitle
