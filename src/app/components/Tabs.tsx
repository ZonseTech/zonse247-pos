import { type PropsWithChildren, useState, type ReactElement, type FC, Children, type MouseEvent, type FunctionComponent, Fragment } from 'react';
import Button from './Button';

const Tabs: FunctionComponent<PropsWithChildren> = ({ children }) => {
	const validChildren = Children.toArray(children) as ReactElement<PropsWithChildren<{ label: string; }>>[];

	const [activeTab, setActiveTab] = useState(validChildren[0].props.label);

	const handleClick = (e: MouseEvent<HTMLButtonElement>, newActiveTab: string) => {
		e.preventDefault();
		setActiveTab(newActiveTab);
	};

	return (
		<Fragment>
			<div className="flex border-b border-gray-200">
				{validChildren.map(child => (
					<Button
						layout='outline'
						key={child.props.label}
						theme={activeTab.toLowerCase() === child.props.label?.toLowerCase() ? 'neutral' : undefined}
						className='flex-1 text-gray-800 dark:text-gray-400 py-3'
						onClick={(e: MouseEvent<HTMLButtonElement>) => handleClick(e, child.props.label)}
					>
						{child.props.label}
					</Button>
				))}
			</div>
			<div className="py-4">
				{validChildren.map(child => {
					if (child.props.label?.toLowerCase() === activeTab.toLowerCase()) {
						return <div key={child.props.label}>{child.props.children}</div>;
					}

					return null;
				})}
			</div>
		</Fragment>
	);
};

const Tab: FC<PropsWithChildren<{ label: string; }>> = ({ label, children }) => {
	return (
		<div id={label}>
			{children}
		</div>
	);
};

export { Tabs, Tab };
