import React, { createContext, useContext, useState, useEffect } from 'react';

declare global {
	interface Window {
		electron: {
			on: (
				channel: string,
				callback: (...args: any[]) => void) => (() => void) | null;
		};
	}
}

interface ModalContextType {
	openModal: (modalName: string) => void;
	closeModal: (modalName: string) => void;
	isModalOpen: (modalName: string) => boolean;
}

const ModalContext = createContext<ModalContextType>({
	openModal: () => {
		// 
	},
	closeModal: () => {
		// 
	},
	isModalOpen: () => false,
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (window.electron) {
			const unsubscribe = window.electron.on('menu-action', (action: string) => {
				if (action === 'newProductModal') {
					openModal('productModal');
				} else if (action === 'newCategoryModal') {
					openModal('categoryModal');
				} else if (action === 'newCustomerModal') {
					openModal('customerModal');
				} else if (action === 'productModal') {
					openModal('productModal');
				} else if (action === 'log-out') {
					console.log('Logging out...');
				}
			});

			return () => {
				if (unsubscribe) unsubscribe();
			};
		}
	}, []);

	const openModal = (modalName: string) => {
		setOpenModals(prev => ({ ...prev, [modalName]: true }));
	};

	const closeModal = (modalName: string) => {
		setOpenModals(prev => ({ ...prev, [modalName]: false }));
	};

	const isModalOpen = (modalName: string) => {
		return !!openModals[modalName];
	};

	return (
		<ModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
			{children}
		</ModalContext.Provider>
	);
};

export const useModal = () => useContext(ModalContext);