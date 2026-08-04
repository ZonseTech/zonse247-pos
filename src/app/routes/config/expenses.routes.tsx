import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const Expenses = lazy(() => import('../../pages/expenses'))
const ExpenseCategories = lazy(() => import('../../pages/expenses/categories'))

export const ExpenseRoutes = (
    <>
        <Route path={ROUTES.EXPENSES} element={<PermissionRoute anyOf={['expenses.view', 'expenses.create', 'expenses.approve', 'expenses.void']}><Expenses /></PermissionRoute>} />
        <Route path={ROUTES.EXPENSE_CATEGORIES} element={<PermissionRoute permission="expenses.manage_categories"><ExpenseCategories /></PermissionRoute>} />
    </>
)
