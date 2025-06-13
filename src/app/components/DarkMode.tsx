import { type FunctionComponent, useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import IconButton from './IconButton';

interface DarkModeProps {
	color?: string;
}

const DarkMode: FunctionComponent<DarkModeProps> = ({ color = 'bg-teal-500' }) => {
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
			color={color}
			onClick={toggleMode}
		/>
	)
}

export default DarkMode