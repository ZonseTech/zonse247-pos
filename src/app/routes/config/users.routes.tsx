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
        <Route path={ROUTES.USERS} element={<PermissionRoute permission="users.view"><Users /></PermissionRoute>} />
        <Route path={ROUTES.USER_FORM} element={<PermissionRoute anyOf={['users.create', 'users.edit']}><UserForm /></PermissionRoute>} />
        <Route path={ROUTES.CUSTOMERS} element={<Customers />} />
        <Route path={ROUTES.ROLES_PERMISSIONS} element={<PermissionRoute permission="roles.view"><RolesAndPermissions /></PermissionRoute>} />
    </>
)
