import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const GeneralSettingsPage = lazy(() => import('../../pages/settings/GeneralSettingsPage'))
const SalesSettingsPage = lazy(() => import('../../pages/settings/BusinessSettingsPage'))
const ReceiptSettingsPage = lazy(() => import('../../pages/settings/ReceiptSettingsPage'))
const SecuritySettingsPage = lazy(() => import('../../pages/settings/SecuritySettingsPage'))
const SettingsPage = lazy(() => import('../../pages/settings/SettingsPage'))
const NavigationSettingsPage = lazy(() => import('../../pages/settings/NavigationSettingsPage'))
const NotFound = lazy(() => import('../../pages/errors/NotFound'))
const UnderConstruction = lazy(() => import('../../pages/errors/UnderConstruction'))
const Forbidden = lazy(() => import('../../pages/errors/Forbidden'))

export const SystemRoutes = (
    <>
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />}>
            <Route index element={<Navigate to={ROUTES.SETTINGS_GENERAL} replace />} />
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="sales" element={<SalesSettingsPage />} />
            <Route path="receipt" element={<ReceiptSettingsPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
            <Route path="navigation" element={<PermissionRoute permission="settings.navigation.manage"><NavigationSettingsPage /></PermissionRoute>} />
        </Route>
    </>
)

export const ErrorRoutes = (
    <>
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/under-construction" element={<UnderConstruction />} />
        <Route path="/forbidden" element={<Forbidden />} />
    </>
)
