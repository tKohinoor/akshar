import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob'
import { ADS_TESTING, BANNER_AD_ID } from './config'

let initPromise = null

function ensureInit() {
  if (!initPromise) {
    initPromise = AdMob.initialize().catch((err) => {
      initPromise = null // allow a retry later
      throw err
    })
  }
  return initPromise
}

export async function showBannerAd() {
  try {
    await ensureInit()
    await AdMob.showBanner({
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: ADS_TESTING,
    })
  } catch {
    // An ad that fails to load must never break reading
  }
}

export async function resumeBannerAd() {
  try {
    await AdMob.resumeBanner()
  } catch {}
}

export async function hideBannerAd() {
  try {
    await AdMob.hideBanner()
  } catch {}
}

export async function removeBannerAd() {
  try {
    await AdMob.removeBanner()
  } catch {}
}