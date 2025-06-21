import React, { type PropsWithChildren } from 'react'

const FormWrapper: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className='flex flex-grow flex-1 flex-col gap-4'>
			{children}
		</div>
	)
}

export default FormWrapper