import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const GeneralSettingsPage = lazy(() => import('../../pages/settings/GeneralSettingsPage'))
const SalesSettingsPage = lazy(() => import('../../pages/settings/BusinessSettingsPage'))
const ReceiptSettingsPage = lazy(() => import('../../pages/settings/ReceiptSettingsPage'))
const SecuritySettingsPage = lazy(() => import('../../pages/settings/SecuritySettingsPage'))
const SettingsPage = lazy(() => import('../../pages/settings/SettingsPage'))
const SyncData = lazy(() => import('../../pages/sync-data'))
const DatabaseExporter = lazy(() => import('../../pages/export-db'))
const NotFound = lazy(() => import('../../pages/errors/NotFound'))
const UnderConstruction = lazy(() => import('../../pages/errors/UnderConstruction'))

export const SystemRoutes = (
    <>
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />}>
            <Route index element={<Navigate to={ROUTES.SETTINGS_GENERAL} replace />} />
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="sales" element={<SalesSettingsPage />} />
            <Route path="receipt" element={<ReceiptSettingsPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
        </Route>
        <Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
        <Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
    </>
)

export const ErrorRoutes = (
    <>
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/under-construction" element={<UnderConstruction />} />
    </>
)
