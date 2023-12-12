/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SOME_KEY: number
    //  更多环境变量
    readonly VITE_APP_TITLE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}