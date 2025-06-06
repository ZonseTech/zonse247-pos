import Loader from '../../../components/Loader';
import CreateUserModal from './CreateUserModal';
import SplitButton from '../../../components/SplitButton';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { Input, Modal, ZonseThemeContext } from '../../../components';
import { type ChangeEvent, Fragment, type FunctionComponent, useContext, useEffect, useState } from 'react'
import { HiOutlineMenuAlt4, HiOutlinePencilAlt, HiOutlineSearch, HiOutlineTrash, HiOutlineViewList } from 'react-icons/hi';
import usersService from '../../../services/users.service';
import { Notify } from 'notiflix';
import { hasPermission } from '../../../utils';

const UsersModal: FunctionComponent = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isOpenForm, setIsOpenForm] = useState(false);

    const columns: TableColumn<User>[] = [
        {
            name: "Full Name",
            selector: (row) => row?.fullname?.toUpperCase(),
        },
        {
            name: "Username",
            selector: (row) => row?.username?.toLowerCase(),
        },
        {
            name: "Status",
            cell: (row) => (
                <span className={`text-sm font-semibold ${row.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: <HiOutlineMenuAlt4 className='w-5 h-5' />,
            cell: (row) => (
                <div className='gap-2 flex'>
                    <HiOutlinePencilAlt
                        className='w-5 h-5 text-sky-400 cursor-pointer'
                        onClick={() => console.log('Editing...', row.uuid)}
                    />
                    {
                        !hasPermission(row, "permUsers") && (
                            <HiOutlineTrash
                                className='w-5 h-5 text-red-400 cursor-pointer'
                                onClick={() => console.log('Deleting...', row.uuid)}
                            />
                        )
                    }
                </div>
            ),
        },
    ]

    const handleUsersClicked = () => {
        setIsOpenForm(!isOpenForm);
    }

    const handlePageChange = async (page: number) => setPage(page);

    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await usersService.list();
            setUsers(response);
            setTotalRows(response.length);
        } catch (error) {
            Notify.failure('An error occurred while loading users' + error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        // 
    }, [page, perPage])

    useEffect(() => {
        const filteredUsers = users.filter((user) =>
            user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setTotalRows(filteredUsers.length);
    }, [searchTerm, users]);

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

    return (
        <Fragment>
            <SplitButton
                color='bg-green-400'
                iconColor='bg-green-500'
                text='Users'
                onClick={handleUsersClicked}
                icon={<HiOutlineViewList className='w-5 h-5' />}
                plusAction={<CreateUserModal />}
            />

            <Modal
                title='Users'
                isOpen={isOpenForm}
                onClose={handleUsersClicked}
                className='max-w-3xl bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'>
                <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex-1  relative">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="rounded-md px-3 py-2.5 pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={users}
                    theme={mode as any}
                    progressComponent={<Loader isLoading={isLoading} />}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                />

            </Modal>
        </Fragment>
    )
}

export default UsersModal