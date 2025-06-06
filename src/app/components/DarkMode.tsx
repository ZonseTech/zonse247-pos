import { type FunctionComponent, useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import IconButton from './IconButton';

const DarkMode: FunctionComponent = () => {
	const { mode, toggleMode } = useContext(ThemeContext);

	return (
		<IconButton
			icon={mode === "dark" ? (
				<HiOutlineSun
					className="w-5 h-5"
					aria-hidden="true"
				/>
			) : (
				<HiOutlineMoon
					className="w-5 h-5"
					aria-hidden="true"
				/>
			)}
			color='bg-teal-500'
			onClick={toggleMode}
		/>
	)
}

export default DarkMode