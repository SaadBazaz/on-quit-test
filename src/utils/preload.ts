import mime from 'mime'

export async function preloadAssets() {
    try {
        const assetsContext1 = import.meta.glob('/src/assets/**/*.*', {
            eager: true,
        })
        const assetsContext2 = import.meta.glob('../../public/manifest.json', {
            eager: true,
        })
        const assetsContext3 = import.meta.glob('../../public/*', {
            eager: true,
        })

        const assetsContext = [
            ...Object.values(assetsContext1),
            ...Object.values(assetsContext2),
            ...Object.values(assetsContext3),
        ]

        // Get the asset URLs
        const assetUrls = assetsContext.map(
            // @ts-ignore
            (module) => module.default
        )

        console.log('[preloadAssets] assetUrls', assetUrls)

        // Preload assets
        const promises = assetUrls
            .map((url) => {
                const fileType = mime.getType(url)
                if (!fileType) return null
                if (fileType.startsWith('image')) {
                    // Preload image
                    const img = new Image()
                    img.src = url
                    return new Promise((resolve) => {
                        img.onload = resolve
                    })
                } else if (fileType.startsWith('audio')) {
                    // Preload audio
                    const audio = new Audio()
                    audio.src = url
                    audio.muted = true
                    return new Promise((resolve) => {
                        audio.onloadeddata = resolve
                    })
                } else if (fileType.startsWith('font')) {
                    // Preload font
                    const font = new FontFace('preloadFont', `url(${url})`)
                    return font.load().then(() => {
                        document.fonts.add(font)
                    })
                }
                return null
            }).filter(Boolean)
        await Promise.all(promises)
    } catch (error) {
        console.error(
            '[preloadAssets] There was an error while preloading assets. Reason:',
            error
        )
    }
}
