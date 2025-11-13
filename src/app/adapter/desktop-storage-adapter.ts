class DesktopStorageAdapter implements DataStoreAdapter {
    async hasSetup() {
        return window.electronAPI.settings.hasSetup();
    }

    async getSetup() {
        return window.electronAPI.settings.getSetup();
    }

    async saveSetup(data: SetupData) {
        return window.electronAPI.settings.saveSetup(data);
    }

    async updateSetup(updates: Partial<SetupData>) {
        return window.electronAPI.settings.updateSetup(updates);
    }

    async clearSetup() {
        return window.electronAPI.settings.clearSetup();
    }

    async getSignature() {
        return window.electronAPI.settings.getSignature();
    }
}

export default DesktopStorageAdapter