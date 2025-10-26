import nprogress from "nprogress";

export const NProgress = nprogress.configure({
    showSpinner: true,
    speed: 500,
    minimum: 0.3
})
