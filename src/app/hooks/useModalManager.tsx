import { useEffect, useState } from 'react';

export function useModalManager() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    useEffect(() => {
        if (!window.electronAPI?.menu) {
            console.log('Not running in Electron, menu handlers disabled');
            return;
        }

        const handleOpenModal = (event: CustomEvent) => {
            const { modalName } = event.detail;
            setOpenModal(modalName);
        };

        window.addEventListener('open-modal', handleOpenModal as EventListener);

        return () => {
            window.removeEventListener('open-modal', handleOpenModal as EventListener);
        };
    }, []);

    const closeModal = () => setOpenModal(null);

    return { openModal, closeModal };
}

// Usage in your component:
// function YourComponent() {
//     const { openModal, closeModal } = useModalManager();

//     return (
//         <>
//             {openModal === 'new-product' && <NewProductModal onClose={closeModal} />}
//             {openModal === 'new-category' && <NewCategoryModal onClose={closeModal} />}
//             {openModal === 'new-customer' && <NewCustomerModal onClose={closeModal} />}
//             {openModal === 'about' && <AboutModal onClose={closeModal} />}
//         </>
//     );
// }