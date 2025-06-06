import Select from 'react-select'
import AddCustomerModal from '../AddCustomerModal';
import { useProducts } from '../../../context/ProductsProvider';
import { Fragment, FunctionComponent, useEffect, useState } from 'react'

const CustomerFilter: FunctionComponent = () => {
    const [customer, setCustomer] = useState<string>("");
    const { customers, fetchCustomers, setSelectedCustomer } = useProducts();

    useEffect(() => {
        const arr = customers.filter((c) => c.uuid === customer.toString())
        if (arr.length > 0) setSelectedCustomer(arr[0]);
    }, [customer]);

    useEffect(() => {
        if (customers.length) setCustomer(customers[0].uuid)
    }, [customers])

    const handleSelectedCustomer = async (cus: Customer) => {
        await fetchCustomers();
        setTimeout(() => {
            setCustomer(cus.uuid);
        }, 200);
    }

    const options = [
        ...customers.map((c) => ({
            value: c.uuid,
            label: c.name
        }))
    ];

    return (
        <Fragment>
            <div className="flex mb-4 px-2.5 pt-2.5">
                <Select
                    value={options.find(opt => opt.value.toString() === customer.toString())}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setCustomer(selectedOption.value);
                        }
                    }}
                    isSearchable
                    options={options}
                    className="flex-grow rounded-sm rounded-r-none"
                    classNamePrefix="react-select"
                />
                <AddCustomerModal handleSelectedCustomer={handleSelectedCustomer} />
            </div>
        </Fragment>
    )
}

export default CustomerFilter