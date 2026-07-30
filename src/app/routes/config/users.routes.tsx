import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const Users = lazy(() => import('../../pages/users/index'))
const UserForm = lazy(() => import('../../pages/users/create'))
const Customers = lazy(() => import('../../pages/customers'))
const RolesAndPermissions = lazy(() => import('../../pages/role-permissions'))

export const UserRoutes = (
    <>
        <Route path={ROUTES.USERS} element={<Users />} />
        <Route path={ROUTES.USER_FORM} element={<UserForm />} />
        <Route path={ROUTES.CUSTOMERS} element={<Customers />} />
        <Route path={ROUTES.ROLES_PERMISSIONS} element={<PermissionRoute permission="roles.view"><RolesAndPermissions /></PermissionRoute>} />
    </>
)
